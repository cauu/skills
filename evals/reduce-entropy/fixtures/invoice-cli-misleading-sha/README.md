# invoice-cli

```sh
node bin/invoice.js data/orders.json          # report
node bin/invoice.js data/orders.json --csv    # CSV export
```

The report prints one row per order (local order date, order number, order total) and ends with a `TOTAL` row: the grand total of all orders.

Lines of more than 10 units get 5% off. Amounts are integer cents.
