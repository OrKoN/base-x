#[macro_use]
extern crate neon;
extern crate base_x;

use neon::vm;
use neon::vm::{Call, JsResult};
use neon::js::{JsInteger, JsString};
use neon::js::binary::JsBuffer;
use neon::mem::Handle;
use neon::js::Object;

fn encode(call: Call) -> JsResult<JsString> {
  let scope = call.scope;
  let alphabet: Handle<JsString> = try!(try!(call.arguments.require(scope, 0)).check::<JsString>());
  let alphabet =  &alphabet.value();
  let buffer: Handle<JsBuffer> = try!(try!(call.arguments.require(scope, 1)).check::<JsBuffer>());
  let result = vm::lock(buffer, |data| {
    let mut vec:Vec<i16> = Vec::new();
    for el in data.as_slice().unwrap() {
      vec.push((*el) as i16);
    }
    base_x::encode(alphabet, vec)
  });
  Ok(JsString::new(scope, &result).unwrap())
}

fn decode(call: Call) -> JsResult<JsBuffer> {
  let scope = call.scope;
  let alphabet: Handle<JsString> = try!(try!(call.arguments.require(scope, 0)).check::<JsString>());
  let alphabet =  &alphabet.value();
  let input: Handle<JsString> = try!(try!(call.arguments.require(scope, 1)).check::<JsString>());
  let input =  &input.value();
  let result = base_x::decode(alphabet, input);
  let buffer = try!(JsBuffer::new(scope, result.len() as u32));
  let len = result.len();
  vm::lock(buffer, |mut data| {
    let mut b = data.as_mut_slice().unwrap();
    let mut i = 0;
    for x in & result {
      b[i] = (*x as u8);
      i=i+1;
    }
  });
  Ok(buffer)
}

register_module!(m, {
  try!(m.export("encode", encode));
  try!(m.export("decode", decode));
  Ok(())
});