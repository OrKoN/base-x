#[macro_use]
extern crate neon;
extern crate base_x;

use neon::vm::{Call, JsResult, Lock};
use neon::js::JsString;
use neon::js::binary::JsBuffer;
use neon::mem::Handle;

fn encode(call: Call) -> JsResult<JsString> {
    let scope = call.scope;

    let alphabet = call.arguments
        .require(scope, 0)?
        .check::<JsString>()?
        .value();

    let mut buffer = call.arguments
        .require(scope, 1)?
        .check::<JsBuffer>()?;

    let result = buffer.grab(|data| base_x::encode(alphabet.as_bytes(), data.as_slice()));

    Ok(JsString::new(scope, &result).unwrap())
}

fn decode(call: Call) -> JsResult<JsBuffer> {
    let scope = call.scope;

    let alphabet = call.arguments
        .require(scope, 0)?
        .check::<JsString>()?
        .value();

    let input = call.arguments
        .require(scope, 1)?
        .check::<JsString>()?
        .value();

    let mut result = base_x::decode(alphabet.as_bytes(), &input).unwrap();
    let mut buffer = JsBuffer::new(scope, result.len() as u32)?;
    buffer.grab(|mut data| {
        let mut slice = data.as_mut_slice();
        for i in 0..result.len() {
            slice[i] = result[i];
        }
    });

    Ok(buffer)
}

register_module!(m, {
    m.export("encode", encode)?;
    m.export("decode", decode)?;

    Ok(())
});
