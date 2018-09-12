const express = require('express'),
      router = express.Router(),
      validatePayload = require('../middleware/validatePayload'),
      { Customer, validate: customer } = require('../models/customer'),
      auth = require('../middleware/auth');

const notFoundMsg = 'Customer not found.';

router.get('/', async (req, res) => {
  const customers = await Customer.find()
    .sort({ name: 1 })
    .select({ __v: 0 });

  res.send(customers);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findById(id).select({ __v: 0 });

  if ( !customer ) return res.status(404).send(notFoundMsg);

  res.send(customer);
});

router.post('/', [auth, validatePayload(customer)], async (req, res) => {
  const { name, phone, isGold } = req.body;

  const customer = new Customer({ name, phone, isGold });

  await customer.save();

  res.send(customer);
});

router.put('/:id', [auth, validatePayload(customer)], async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  const customer = await Customer
    .findByIdAndUpdate(id, { name, phone }, { new: true })
    .select({ __v: 0 });

  if ( !customer ) return res.status(404).send(notFoundMsg);

  res.send(customer);
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  const customer = await Customer.findByIdAndRemove(id);

  if ( !customer ) return res.status(404).send(notFoundMsg);

  res.send(customer);
});

module.exports = router;