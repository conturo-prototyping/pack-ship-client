const { Router } = require("express");
const router = Router();
const PackingSlip = require('./model.js');

module.exports = router;

router.get('/', getAllPackingSlips);
router.put('/', createPackingSlip);

router.post('/merge', mergePackingSlips);

router.get('/:pid', getPackingSlip);
router.patch('/:pid', editPackingSlip);
router.delete('/:pid', deletePackingSlip);

/**
 * Generic handler for packing slip functions
 * @param {Function} f 
 * @param {String} msg 
 * @returns 
 */
const handler = async (f, msg, res) => {
  try {
    const [error, data] = await f();
    if (error) res.status( error.status ).send( error.message );
    else res.send( data );
  }
  catch (e) {
    console.error(e);
    return [{ status: 500, message: `Unespected error ${msg}.` }];
  }
};

/**
 * Get a list of all packing slips
 */
async function getAllPackingSlips(_req, res) {
  handler(
    async () => {
      const packingSlips = await PackingSlip.find()
        .lean()
        .exec();

      return [null, { packingSlips }];
    },
    'fetching packing slips',
    res
  );
}

/**
 * Create a new packing slip given an orderNumber & 
 */
async function createPackingSlip(req, res) {
  handler(
    async () => {
      const { items, orderNumber, customer } = req.body;
      const numPackingSlips = await PackingSlip.countDocuments({ orderNumber });

      const packingSlipId = `${orderNumber}-PS${numPackingSlips+1}`;

      const packingSlip = new PackingSlip({
        customer,
        orderNumber,
        packingSlipId,
        items
      });

      await packingSlip.save();
      return [null, { packingSlip }];
    },
    'creating packing slip',
    res
  );
}

/**
 * Get a specified packing slip by mongo _id
 */
async function getPackingSlip(req, res) {
  handler(
    async () => {
      const { pid } = req.params;

      const packingSlip = await PackingSlip.findById(pid)
        .lean()
        .exec();

      return [null, { packingSlip }];
    },
    'fetching packing slip',
    res
  );
}

/**
 * Edit a specified packing slip given its mongo _id & its new array items[]
 */
async function editPackingSlip(req, res) {
  handler(
    async () => {
      const { pid } = req.params;
      const { items } = req.body;

      await PackingSlip.updateOne(
        { _id: pid },
        { $set: {
          items
        } }
      );

      return [null, ];
    },
    'editing packing slip',
    res
  );
}

/**
 * Delete a specified packing slip given its mongo _id
 */
async function deletePackingSlip(req, res) {
  handler(
    async () => {
      const { pid } = req.params;

      await PackingSlip.deleteOne({ _id: pid });
      return [null, ];
    },
    'deleting packing slip',
    res
  );
}

/**
 * Merge an arbitrary number of packing slips given an array of mongo _ids
 */
async function mergePackingSlips(req, res) {
  handler(
    async () => {
      const { pids, orderNumber } = req.body;

      const numPackingSlips = await PackingSlip.countDocuments({ orderNumber });
      const packingSlips = await PackingSlip.find({ _id: { $in: pids } })
        .lean()
        .exec();

      if ( !packingSlips?.length ) return [{ status: 400, message: 'Packing slips not found.' }];

      const packingSlipId = `${orderNumber}-PS${ numPackingSlips - pids.length + 1 }`;
      const itemsFlat = [].concat( ...packingSlips.map(x => x.items) );

      // fix qties to not have a bunch of packing slips with repeat item(Ids) & qties all over the place
      const items = [];
      itemsFlat.forEach( ({ item, qty }) => {
        const i = items.findIndex(x => String(x.item) === String(item));
        if (i >= 0) items[i].qty += qty;
        else items.push({ item, qty });
      });

      const packingSlip = new PackingSlip({
        orderNumber,
        packingSlipId,
        items
      });

      await PackingSlip.deleteMany({ _id: { $in: pids } });
      await packingSlip.save();

      return [null, { packingSlip }];
    },
    'merging packing slips',
    res
  );
}