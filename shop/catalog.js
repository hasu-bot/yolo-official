/* Canonical source: hasu-bot/yolo-official/shop/catalog.js. No store URL is confirmed.
   inventoryPlan is a proposal, NOT live STORES stock. Keep release gates closed until verified. */
window.LAST_CALL_GOODS = {
  "provider": "STORES",
  "storeOrigin": null,
  "release": {
    "storeVerified": false,
    "checkoutVerified": false,
    "salesTermsVerified": false
  },
  "inventoryPlan": {
    "status": "proposed",
    "components": {
      "towel": 20,
      "tote": 20,
      "badge": 20
    },
    "allocations": {
      "daily": 7,
      "towel": 7,
      "support": 6
    }
  },
  "shipping": {
    "country": "JP",
    "fee": 500,
    "dispatchWithinDays": 7,
    "freeShipping": false,
    "express": false
  },
  "products": [
    {
      "id": "daily",
      "name": "日常使いセット",
      "label": "DAILY SET",
      "description": "トートバッグと缶バッジを、日々の暮らしへ。",
      "priceText": "¥3,000",
      "price": 3000,
      "specifications": [
        "トートバッグ 1点",
        "缶バッジ 1点"
      ],
      "components": {
        "tote": 1,
        "badge": 1
      },
      "photo": null,
      "status": "preparing",
      "productUrl": null
    },
    {
      "id": "towel",
      "name": "タオルセット",
      "label": "TOWEL SET",
      "description": "タオルと缶バッジで、映画の余韻をそばに。",
      "priceText": "¥3,500",
      "price": 3500,
      "specifications": [
        "タオル 1点",
        "缶バッジ 1点"
      ],
      "components": {
        "towel": 1,
        "badge": 1
      },
      "photo": null,
      "status": "preparing",
      "productUrl": null
    },
    {
      "id": "support",
      "name": "応援セット",
      "label": "SUPPORT SET",
      "description": "タオル、トートバッグ、缶バッジをひとつに。",
      "priceText": "¥5,500",
      "price": 5500,
      "specifications": [
        "タオル 1点",
        "トートバッグ 1点",
        "缶バッジ 1点"
      ],
      "components": {
        "towel": 1,
        "tote": 1,
        "badge": 1
      },
      "photo": null,
      "status": "preparing",
      "productUrl": null
    }
  ]
};
