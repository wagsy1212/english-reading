import requests
from bs4 import BeautifulSoup
import json
import time
import re

BASE_URL = "https://www.eslfast.com/begin2/index2.htm"
BASE_URL_2 = "https://www.eslfast.com"
HEADERS = {'User-Agent': 'Mozilla/5.0'}

def get_article_links():
    response = requests.get(BASE_URL, headers=HEADERS)
    soup = BeautifulSoup(response.text, 'html.parser')
    links = []

    for a in soup.select("li a"):
        href = a.get("href")
        if href and href.endswith(".htm") and 'index' not in href.lower():
            links.append(BASE_URL_2 + href)

    return links

def get_article_content(url):
    res = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(res.text, 'html.parser')

    # Lấy tiêu đề
    title = soup.find("h1") or soup.find("title")
    title_text = title.text.strip() if title else "No Title"

    # Tìm tất cả <p><span>...</span></p>
    spans = soup.select("p span")
    content_parts = []
    for span in spans:
        text = span.get_text(strip=True)
        # Dừng lại khi gặp nội dung HOME...
        if "HOME (Android Version) (iOS Version)" in text:
            break
        content_parts.append(text)

    content_parts = content_parts[:-3]

    content = " ".join(content_parts)

    return {
        "title": title_text,
        "content": content
    }

def crawl_all_articles():
    links = get_article_links()
    print(f"Tìm thấy {len(links)} bài đọc.")

    articles = []
    for i, link in enumerate(links, 1):
        try:
            print(f"Crawl bài {i}/{len(links)}: {link}")
            article = get_article_content(link)
            articles.append(article)
            time.sleep(0.5)  # delay nhẹ để tránh bị block
        except Exception as e:
            print(f"Lỗi khi crawl {link}: {e}")

    return articles

def save_articles_to_file(articles, filename="esl_articles_2.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

# Chạy script
if __name__ == "__main__":
    data = crawl_all_articles()
    save_articles_to_file(data)
    print("✅ Đã lưu dữ liệu vào esl_articles.json")
