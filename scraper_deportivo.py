import json
import time
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

SITIOS_WEB = [
    {'nombre': 'AS', 'url': 'https://as.com/', 'selector': 'h2.s__tl a'},
    {'nombre': 'Marca', 'url': 'https://www.marca.com/', 'selector': 'h2.ue-c-cover-content__headline'}
]

def handle_cookie_banner(driver, sitio_nombre):
    time.sleep(3)
    # Banner de AS (puede cambiar, buscamos uno común)
    if sitio_nombre == 'AS':
        try:
            iframe = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.XPATH, "//iframe[contains(@id, 'sp_message_iframe')]")))
            driver.switch_to.frame(iframe)
            agree_button = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, "//button[@title='ACEPTAR']")))
            agree_button.click()
            driver.switch_to.default_content()
            print(f"  -> Banner de cookies de '{sitio_nombre}' gestionado.")
            time.sleep(2)
            return
        except TimeoutException:
            driver.switch_to.default_content()
            print(f"  -> No se encontró el iframe de cookies de '{sitio_nombre}'.")

    # Banner genérico para Marca u otros
    try:
        button = WebDriverWait(driver, 3).until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Aceptar')]")))
        button.click()
        print(f"  -> Banner de cookies genérico para '{sitio_nombre}' gestionado.")
        time.sleep(2)
    except TimeoutException:
        print(f"  -> No se encontró un banner de cookies conocido para '{sitio_nombre}'.")


def obtener_titulares_deportivos():
    resultados_finales = []
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    driver = None
    try:
        # Los runners de GitHub Actions ya tienen chromedriver, no se necesita webdriver-manager
        service = Service() 
        driver = webdriver.Chrome(service=service, options=chrome_options)

        for sitio in SITIOS_WEB:
            titulares_sitio = []
            try:
                print(f"\n--- PROCESANDO: {sitio['nombre']} ---")
                driver.get(sitio['url'])
                handle_cookie_banner(driver, sitio['nombre'])

                WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, sitio['selector'])))
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                elementos = soup.select(sitio['selector'])
                print(f"  -> Encontrados {len(elementos)} elementos con el selector.")

                for el in elementos:
                    if len(titulares_sitio) >= 10:
                        break
                    
                    titulo = el.get_text(strip=True)
                    link_tag = el if el.name == 'a' else el.find_parent('a')
                    link = link_tag['href'] if link_tag and link_tag.has_attr('href') else sitio['url']
                    
                    if titulo and link:
                        if not link.startswith('http'):
                            link = requests.compat.urljoin(sitio['url'], link)
                        
                        titulares_sitio.append({
                            "title": titulo,
                            "link": link,
                            "source": sitio['nombre']
                        })
                
                resultados_finales.extend(titulares_sitio)
                print(f"  -> Extraídos {len(titulares_sitio)} titulares de {sitio['nombre']}.")

            except Exception as e:
                print(f"  -> ERROR procesando {sitio['nombre']}: {e}")
    finally:
        if driver:
            driver.quit()

    with open('titulares.json', 'w', encoding='utf-8') as f:
        json.dump(resultados_finales, f, ensure_ascii=False, indent=2)
    
    print("\nArchivo 'titulares.json' creado/actualizado con éxito.")

if __name__ == "__main__":
    obtener_titulares_deportivos()
