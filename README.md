## Packing & Shipping demo module.
Client is WIP.

To run server `cd server` & `yarn dev`

By default, app will run on port 3000, add PORT to your .env file to change that.

To fill DB with dummy data: `GET /reset`

Postman endpoints included in 'Packing & Shipping Demo.postman_collection.json'

### Intended Flow
Work Orders & Customers exist permanently.

Packing slips are created from work orders & the desired qty (may be less, equal to, or greater than work order qty).
Shipments are created from existing packing slips that do not yet belong to another shipment.

Both packing slips and shipments can be created, edited, or deleted at any time.
Deletion should prompt user for confirmation.
