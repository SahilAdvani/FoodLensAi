# FoodLensAI API Documentation

## Analyze Food Label Image

Analyzes a food product label image and returns detected ingredients along with safety explanations using OCR + RAG.

---

### Endpoint

**POST** `/analyze`

---

### Payload

Send the request as **multipart/form-data**.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| image | File | ✅ Yes | Image of the food label to analyze |

**Example (Form Data):**
```
image: <upload image file>
```


---

### Response

#### ✅ Success Response (200)

```json
{
  "success": true,
  "data": {
    "success": true,
    "raw_text": "Sugar, Wheat Flour, Sodium Citrate, ...",
    "ingredients_detected": [
      "Sugar",
      "Sodium Citrate",
      "Potassium Sorbate"
    ],
    "analysis": {
      "results": [
        {
          "ingredient": "Sugar",
          "role": "Sweetener / Energy source",
          "evidence": "Strong for harm at high intakes",
          "explanation": "High intake of sugar is associated with weight gain and metabolic risks."
        },
        {
          "ingredient": "Sodium Citrate",
          "role": "Acidity regulator / Buffer",
          "evidence": "Generally supportive of safety at normal intakes",
          "explanation": "Sodium citrate is considered safe when used within regulated limits."
        }
      ]
    }
  }
}
```

#### ⚠️ No Ingredients Found (200)

```
{
  "success": true,
  "data": {
    "success": true,
    "ingredients": [],
    "message": "No recognizable ingredients found"
  }
}
```

#### ❌ Error Response (500 / Timeout)

```
{
  "success": true,
  "data": {
    "success": false,
    "error": "Analysis failed or timed out",
    "ingredients": [
      "Sugar",
      "Iron",
      "Niacin"
    ]
  }
}
```