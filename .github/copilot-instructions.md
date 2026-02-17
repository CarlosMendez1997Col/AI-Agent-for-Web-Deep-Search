# AI Coding Agent Instructions for AI_DeepSearch

## Project Overview
**Purpose**: Automated discovery and aggregation of funding calls and job opportunities from 9 Colombian government/NGO portals for the Stockholm Environment Institute (SEI).

**Key Stack**: Jupyter notebook (Python) with Selenium, BeautifulSoup, Pandas, SentenceTransformers, FastAPI

**Architecture**: Single-file orchestration (AI_DeepSearch.ipynb) with per-institution scraper functions → unified data consolidation → NLP embeddings → interactive frontend

---

## Critical Workflows & Commands

### Scraping & Web Extraction
- **Static scraping**: Use `requests` + `BeautifulSoup` for simple HTML structures
- **Dynamic scraping**: Use `Selenium` with `WebDriverWait` and CSS selectors for JS-heavy sites
- **URL normalization**: Always use `urljoin(base_url, relative_link)` to resolve relative paths (prevents 404s)
- **Key imports setup**: Selenium requires `ChromeDriverManager().install()` for automatic driver management

### Data Pipeline
1. **Collection**: Each institution has a `corregir_*()` function returning list of dicts with keys: `institucion`, `titulo_convocatoria`, `url_externa`
2. **Consolidation**: `procesar_base_datos_final()` merges 9 sources, applies privacy filters (email regex, contact links), removes noise
3. **Deduplication**: `df.drop_duplicates(subset=['Url'], keep='first')` before final export

### Running the Notebook
- Execute cells sequentially from top to bottom (driver initialization, library imports, then per-institution scrapers)
- Cells 1-4: Setup and imports
- Cells 5-23: Individual institution scrapers (data_1 through data_9)
- Cell 24: Data consolidation and DataFrame construction
- Cells 25-28: NLP embeddings and interactive query interface

---

## Project-Specific Patterns

### Institution Scraper Pattern
```python
def corregir_[institucion_name]():
    url_objetivo = "https://..." 
    base_url = "https://..." # Always required for urljoin
    try:
        # Use requests.get() for static, driver.get() for dynamic
        soup = BeautifulSoup(resp.text, "html.parser")
        # Parse structure, extract titulo + url
        # Return list of dicts with consistent keys
    except Exception as e:
        print(f"Error: {e}")
        return []
```

### HTML Structure Handling
- **Table-based**: `soup.find_all("tr")` → check `len(cols) >= 2`
- **Link-based**: `soup.find_all("a", href=True)` with `urljoin()` for relative paths
- **Class-based**: `soup.select(".class-name")` or `soup.find_all("tag", class_="class-name")`
- **Dynamic content**: Use `WebDriverWait(driver, 15).until(EC.presence_of_element_located(...))` before BeautifulSoup parsing

### Data Validation & Filtering
- **Email detection**: `re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)` for privacy compliance
- **Contact link filtering**: Skip if `"mailto:" in url` or `"tel:" in url` or `"wa.me" in url`
- **Title noise filtering**: Skip titles matching `['privacy', 'terms', 'cookies', 'policy', 'contacto', 'home']` or `len(titulo) < 4`
- **URL deduplication**: Critical before DataFrame export to avoid duplicate records

### NLP & Semantic Search
- **Model**: `SentenceTransformer("all-MiniLM-L6-v2")` for lightweight embeddings
- **Query function**: Encode user query, compute cosine_similarity against pre-computed embeddings, return top-k results
- **Input text**: Concatenate `titulo + " " + descripcion.fillna("")` for richer embeddings

---

## Integration Points & Dependencies

### External Services
- **ChromeDriver**: Auto-managed by `webdriver-manager`; requires headless config for servers
- **PostgreSQL**: Configured via `psycopg2` (not yet integrated in current version)
- **Elasticsearch**: Imported but not yet active; intended for advanced indexing

### Selenium Configuration
```python
options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("user-agent=Mozilla/5.0...")  # Required to avoid blocking
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)
```

### Key DataFrame Convention
- **Master variable**: `df_maestro` → final consolidated table with columns: `Institucion`, `Titulo`, `Url`
- **Input data structure**: Each scraper returns `List[Dict]` with keys exactly: `institucion`, `titulo_convocatoria`, `url_externa`
- **Naming consistency**: Column names switch from camelCase (input) to PascalCase (output) for consistency with pandas best practices

---

## Common Modifications

### Adding a New Institution
1. Create `corregir_[name]()` function following the pattern above
2. Append result to `mis_fuentes = [data_1, ..., data_N]`
3. Test with `procesar_base_datos_final()` to verify schema

### Updating a Scraper
- First, test HTML selectors in a separate cell using `requests.get()` → `BeautifulSoup()`
- Verify `urljoin()` produces correct absolute URLs
- Add debug `print()` statements for titre and URL before appending to list
- Test privacy filters don't over-filter legitimate data

### Debugging Dynamic Pages
- Use `driver.page_source` to inspect rendered HTML after JS execution
- Increase `WebDriverWait` timeout if elements load slowly (15-30 seconds typical)
- Check browser console errors with headless disabled (`options.add_argument("--headless=false")`)

---

## System-Level Notes
- **Language**: Python 3.9+ (required by `SentenceTransformers`)
- **Execution context**: Jupyter notebook (cells maintain state; rerun full notebook if errors occur)
- **Data scale**: 9 sources × ~10-50 convocatorias per source = ~450 records expected
- **Privacy**: Actively filters PII; compliant with Colombian data protection (Habeas Data)
- **MIT License**: Any modifications must maintain attribution to Carlos Mendez, Research Associate I, SEI Latin America
