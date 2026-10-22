const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('shop/shop.js', 'utf8');

function setup({status='preparing', available='true', loaded=true, fails=false, sdk=true}={}) {
  const handlers = {};
  const button = {dataset:{available}, disabled:true, textContent:''};
  const title = {textContent:loaded?'ラストコール 日常使いセット':''};
  const price = {textContent:loaded?'¥3,000':''};
  const live = {hidden:true, querySelector:s=>s==='shopify-data'?title:s==='shopify-money'?price:button};
  const preview = {hidden:false};
  const context = {hidden:true};
  let injected = 0, added = 0, opened = 0;
  const template = {content:{cloneNode:()=>({})},after:()=>injected++};
  const bundle = {querySelector:s=>s==='[data-shop-product]'?live:s==='[data-bundle-preview]'?preview:context};
  const catalog = {querySelectorAll:s=>s==='[data-product-context]'?[template]:[bundle], addEventListener:(name,cb)=>handlers[name]=cb};
  const feedback = {textContent:''};
  const cart = sdk?{addLine:()=>{if(fails) throw Error('offline'); added++; return cart;}, showModal:()=>opened++}:{};
  const cartButton = {disabled:true,addEventListener:(name,cb)=>handlers.cart=cb};
  const document = {body:{dataset:{salesStatus:status}},getElementById:id=>id==='shop-products'?catalog:cart,querySelector:s=>s==='[data-open-cart]'?cartButton:feedback};
  vm.runInNewContext(source,{document,window:{},MutationObserver:class{observe(){}}});
  return {button,preview,context,cartButton,feedback,click:()=>handlers.click({target:{closest:()=>button}}),counts:()=>({injected,added,opened})};
}

test('準備中は販売可能なShopifyデータがあっても商品取得・カートを開始しない',()=>{
  const s=setup(); s.click(); assert.equal(s.button.disabled,true); assert.equal(s.cartButton.disabled,true);
  assert.deepEqual(s.counts(),{injected:0,added:0,opened:0});
});
test('公開後も価格が読み込めなければ案内を維持して購入不可',()=>{
  const s=setup({status:'ready',loaded:false}); s.click(); assert.equal(s.preview.hidden,false); assert.equal(s.context.hidden,true); assert.equal(s.button.disabled,true); assert.equal(s.counts().added,0);
});
test('公開後の販売可能商品だけ標準Shopifyカートに追加する',()=>{
  const s=setup({status:'ready'}); assert.equal(s.button.disabled,false); s.click(); assert.deepEqual(s.counts(),{injected:1,added:1,opened:1});
});
test('在庫なし商品はカート追加不可',()=>{
  const s=setup({status:'ready',available:'false'}); s.click(); assert.equal(s.button.disabled,true); assert.equal(s.counts().added,0);
});
test('SDKが読み込めない場合は購入不可',()=>{
  const s=setup({status:'ready',sdk:false}); s.click(); assert.equal(s.button.disabled,true); assert.equal(s.cartButton.disabled,true);
});
test('カート追加に失敗した場合は日本語の案内を表示する',()=>{
  const s=setup({status:'ready',fails:true}); s.click(); assert.match(s.feedback.textContent,/カートに追加できませんでした/); assert.equal(s.counts().opened,0);
});
