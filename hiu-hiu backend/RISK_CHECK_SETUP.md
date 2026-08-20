# Risk Check Setup

## What the checker can prove

- Green (`safe`) is returned only for a matching Whitelist shop or a staff-reviewed risk record marked safe.
- Red (`scam`) is returned only for a matching staff-reviewed risk record marked scam.
- Yellow (`pending`) means the record is not verified locally, or external search found information that still needs review.
- A search provider failure is shown as an error, never as a yellow or green result.

Web-search results are evidence for a user or moderator to review. A result count alone must not label a person, business, or bank account as a scam.

## Recommended Search Provider: Brave Search API

Google's Custom Search JSON API is closed to new customers and existing customers must transition by January 1, 2027. For a new setup, use Brave Search API for web evidence instead.

1. Create an account and API key at https://api-dashboard.search.brave.com/register.
2. Copy `.env.example` to `.env` in this backend directory.
3. Set these values in `.env`:

```env
RISK_SEARCH_PROVIDER=brave
BRAVE_SEARCH_API_KEY=your-server-only-key
```

4. Restart Django.

The key must stay in the backend `.env` file. Do not add it to a `NEXT_PUBLIC_*` variable, frontend source code, screenshots, or Git.

## Existing Google Custom Search JSON API Customers

Use this only when the Google account already has access to Custom Search JSON API:

```env
RISK_SEARCH_PROVIDER=google
GOOGLE_API_KEY=your-server-only-key
SEARCH_ENGINE_ID=your-programmable-search-engine-id
```

This project currently receives a rejected request from the configured Google provider. In Google Cloud, check that the key belongs to the intended project, the API is enabled, the key restrictions allow `customsearch.googleapis.com`, billing/quota is available, and the Search Engine ID belongs to the same configured search engine.

Official Google references:

- https://developers.google.com/custom-search/v1/overview
- https://developers.google.com/custom-search/v1/introduction

## Internal Registry (Optional)

The backend can still use staff-reviewed `RiskRecord` entries as a local source before calling the web search provider. These records are internal data and are not entered by visitors on the public page. If you do not need an internal registry, leave it empty; the public checker will continue to use the configured web-search provider.

Apply the new database migration once:

```powershell
cd "c:\Users\admin\OneDrive - Naresuan University\Desktop\project\hiu-hiu backend"
.\venv\Scripts\Activate.ps1
python manage.py migrate
```

## External Fraud and Bank Data

There is no general public API that can legally and reliably state whether every Thai bank account is safe or fraudulent. A real automated decision requires a documented data-sharing agreement with an authorized bank, regulator, fraud-data provider, or another source that explicitly permits API use.

Do not scrape social networks, bank sites, or unofficial blacklist pages. Use an official API or a licensed provider, preserve the evidence source, and keep human review before applying a red or green status. Bank account values are personal data, so use HTTPS in production, restrict staff access, minimize retention, and avoid logging raw account numbers.