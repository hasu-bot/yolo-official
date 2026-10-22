const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const official = fs.existsSync(path.join(__dirname, '../shop/catalog.js'));
const catalogPath = path.join(__dirname, official ? '../shop/catalog.js' : '../assets/goods-data.js');
const policy = require(official ? '../shop/catalog-policy.js' : '../assets/catalog-policy.js');
const base = vm.runInNewContext(fs.readFileSync(catalogPath, 'utf8') + ';window.LAST_CALL_GOODS', {window:{}});
function ready() {
  const d=JSON.parse(JSON.stringify(base));
  d.storeOrigin='https://fixture.invalid';
  d.release={storeVerified:true,checkoutVerified:true,salesTermsVerified:true};
  d.inventoryPlan.status='confirmed';
  d.products.forEach(p=>{p.status='available';p.productUrl=d.storeOrigin+'/items/'+p.id;});
  return d;
}
test('production catalog is closed, has approved sets and no invented photo or URL',()=>{
  assert.deepEqual(Array.from(base.products,p=>p.price),[3000,3500,5500]);
  for(const p of base.products){ assert.equal(p.photo,null); assert.equal(p.productUrl,null); assert.equal(policy.purchaseUrl(base,p),null); }
  assert.equal(base.inventoryPlan.status,'proposed');
});
test('dedicated 7/7/6 allocation fits the shared component budget; independent 20 each is rejected',()=>{
  const d=ready(); assert.deepEqual(policy.allocation(d),{valid:true,used:{towel:13,tote:13,badge:20}});
  d.inventoryPlan.allocations={daily:20,towel:20,support:20};
  assert.equal(policy.allocation(d).valid,false); assert.equal(policy.purchaseUrl(d,d.products[0]),null);
  for(const n of [-1,1.5,NaN]){d.inventoryPlan.allocations={daily:n,towel:0,support:0};assert.equal(policy.allocation(d).valid,false);}
  d.products=[];assert.equal(policy.allocation(d).valid,false);
});
test('every release gate is required even with a valid item URL',()=>{
  for(const gate of ['storeVerified','checkoutVerified','salesTermsVerified']){const d=ready();d.release[gate]=false;assert.equal(policy.purchaseUrl(d,d.products[0]),null);}
  const d=ready();d.inventoryPlan.status='proposed';assert.equal(policy.purchaseUrl(d,d.products[0]),null);
});
test('confirmed item links only to the verified HTTPS store; invalid URLs stay closed',()=>{
  const d=ready(), p=d.products[0]; assert.equal(policy.purchaseUrl(d,p),p.productUrl);
  for(const url of [null,'','javascript:alert(1)','http://fixture.invalid/items/daily','https://other.invalid/items/daily','https://fixture.invalid/','https://fixture.invalid/items/daily?q=1','https://fixture.invalid/items/daily#x','https://user:pass@fixture.invalid/items/daily','https://fixture.invalid:444/items/daily']){p.productUrl=url;assert.equal(policy.purchaseUrl(d,p),null,url);}
  p.productUrl='https://fixture.invalid/items/daily';
  for(const origin of [null,'','http://fixture.invalid','https://fixture.invalid/path','https://fixture.invalid/?q=1']){d.storeOrigin=origin;assert.equal(policy.purchaseUrl(d,p),null);}
});
test('preparing and sold out products never have a purchase link',()=>{
  const d=ready();for(const state of ['preparing','sold-out']){d.products[0].status=state;assert.equal(policy.purchaseUrl(d,d.products[0]),null);}
});
