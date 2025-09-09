use std::ops::{AddAssign, SubAssign};

use juniper::{GraphQLScalar, InputValue, ScalarValue, Value};
use serde::{Deserialize, Serialize};

#[derive(GraphQLScalar, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[graphql(parse_token(f64))]
pub struct U54(u64);

impl U54 {
    fn to_output<S: ScalarValue>(&self) -> Value<S> {
        let n: f64 = (*self).0 as f64;
        // limitation is that f64 can only reliably represent all ints up to 2^53 (54 bits)
        // past that, it might not be able to represent a u64, thus converstion be a bit inaccurate
        // leading to some potential bugs when querying with schema

        // other option is to convert a string into a u64 instead (takes a lot more memory for schema)

        // NOTE: 54 bits is fine, all we need as 26 letters in alphabet (2 bit to encode each letter)
        // 26*2 = 54, thus got just enough precision to encode a f64 and reliabily conver to u64
        Value::Scalar(n.into())
    }

    fn from_input<S>(v: &InputValue<S>) -> Result<Self, String>
    where
        S: ScalarValue
    {
        let num: Option<f64> = v.as_float_value();
        match num {
            None => Err(format!("Expected a unsigned 64-bit integer.")),
            Some(n) => {
                // looking if n is between 0 max u64 value and not a decimal
                if n < 0.0 || n > u64::MAX as f64 || n.round() != n {
                    Err(format!("Expected a unsigned 64-bit integer."))
                } else {
                    Ok(U54(n as u64))
                }
            }
        }
    }
}

impl From<u64> for U54 {
    fn from(value: u64) -> Self {
        U54(value)
    }
}

impl From<i32> for U54 {
    fn from(value: i32) -> Self {
        U54(value as u64)
    }
}

impl From<f64> for U54 {
    fn from(value: f64) -> Self {
        U54(value as u64)
    }
}

impl AddAssign<i32> for U54 {
    fn add_assign(&mut self, rhs: i32) {
        self.0 += rhs as u64;
    }
}

impl AddAssign<f64> for U54 {
    fn add_assign(&mut self, rhs: f64) {
        self.0 += rhs as u64; // overflow can occur here  
    }
}

impl AddAssign<u64> for U54 {
    fn add_assign(&mut self, rhs: u64) {
        self.0 += rhs
    }
}

impl SubAssign<i32> for U54 {
    fn sub_assign(&mut self, rhs: i32) {
        self.0 -= rhs as u64;
    }
}

impl SubAssign<f64> for U54 {
    fn sub_assign(&mut self, rhs: f64) {
        self.0 -= rhs as u64; // overflow can occur here
    }
}

impl SubAssign<u64> for U54 {
    fn sub_assign(&mut self, rhs: u64) {
        self.0 -= rhs
    }
}

#[derive(GraphQLScalar, Debug, Serialize, Deserialize)]
#[graphql(parse_token(f64))]
pub struct U32(u32);

impl U32 {
    fn to_output<S: ScalarValue>(&self) -> Value<S> {
        let n: f64 = (*self).0 as f64;
        Value::Scalar(n.into())
    }

    fn from_input<S>(v: &InputValue<S>) -> Result<Self, String>
    where
        S: ScalarValue
    {
        let num: Option<f64> = v.as_float_value();
        match num {
            None => Err(format!("Expected a unsigned 32-bit integer.")),
            Some(n) => {
                // looking if n is between 0 max u32 value and not a decimal
                if n < 0.0 || n > u32::MAX as f64 || n.round() != n {
                    Err(format!("Expected a unsigned 32-bit integer."))
                } else {
                    Ok(U32(n as u32))
                }
            }
        }
    }
}

impl From<u32> for U32 {
    fn from(value: u32) -> Self {
        U32(value)
    }
}

impl From<i32> for U32 {
    fn from(value: i32) -> Self {
        U32(value as u32)
    }
}

impl From<f64> for U32 {
    fn from(value: f64) -> Self {
        U32(value as u32)
    }
}

impl AddAssign<i32> for U32 {
    fn add_assign(&mut self, rhs: i32) {
        self.0 += rhs as u32; // overflow can occur here  
    }
}

impl AddAssign<f64> for U32 {
    fn add_assign(&mut self, rhs: f64) {
        self.0 += rhs as u32; // overflow can occur here  
    }
}

impl AddAssign<u32> for U32 {
    fn add_assign(&mut self, rhs: u32) {
        self.0 += rhs
    }
}

impl SubAssign<i32> for U32 {
    fn sub_assign(&mut self, rhs: i32) {
        self.0 -= rhs as u32; // overflow can occur here
    }
}

impl SubAssign<f64> for U32 {
    fn sub_assign(&mut self, rhs: f64) {
        self.0 -= rhs as u32; // overflow can occur here
    }
}

impl SubAssign<u32> for U32 {
    fn sub_assign(&mut self, rhs: u32) {
        self.0 -= rhs
    }
}

#[derive(GraphQLScalar, Debug, Serialize, Deserialize)]
#[graphql(parse_token(i32))]
pub struct U16(u16);

impl U16 {
    fn to_output<S: ScalarValue>(&self) -> Value<S> {
        let n: i32 = (*self).0 as i32;
        Value::Scalar(n.into())
    }

    fn from_input<S>(v: &InputValue<S>) -> Result<Self, String>
    where
        S: ScalarValue
    {
        let num: Option<i32> = v.as_int_value();
        match num {
            None => Err(format!("Expected a unsigned 16-bit integer.")),
            Some(n) => {
                // looking if n is between 0 and 0xFFFF (max u16 value)
                if n < 0 || n > 0xFFFF {
                    Err(format!("Expected a unsigned 16-bit integer."))
                } else {
                    Ok(U16(n as u16))
                }
            }
        }
    }
}

impl From<u16> for U16 {
    fn from(value: u16) -> Self {
        U16(value)
    }
}

impl From<i32> for U16 {
    fn from(value: i32) -> Self {
        U16(value as u16)
    }
}

impl AddAssign<i32> for U16 {
    fn add_assign(&mut self, rhs: i32) {
        // change up style of addition as now i32 is a larger range than u16
        // so conversion back should cause errors to throw (due to overflow)
        let sum: i32 = i32::from(self.0) + rhs;
        self.0 = sum.try_into().unwrap()    // overflow occured
    }
}
impl AddAssign<u16> for U16 {
    fn add_assign(&mut self, rhs: u16) {
        self.0 += rhs
    }
}

impl SubAssign<i32> for U16 {
    fn sub_assign(&mut self, rhs: i32) {
        let sum: i32 = i32::from(self.0) - rhs;
        self.0 = sum.try_into().unwrap()    // overflow occured
    }
}

impl SubAssign<u16> for U16 {
    fn sub_assign(&mut self, rhs: u16) {
        self.0 -= rhs
    }
}

#[derive(GraphQLScalar, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[graphql(parse_token(i32))]
pub struct U8(u8);

impl U8 {
    fn to_output<S: ScalarValue>(&self) -> Value<S> {
        let n: i32 = (*self).0 as i32;
        Value::Scalar(n.into())
    }

    fn from_input<S>(v: &InputValue<S>) -> Result<Self, String>
    where
        S: ScalarValue
    {
        let num: Option<i32> = v.as_int_value();
        match num {
            None => Err(format!("Expected a unsigned 8-bit integer.")),
            Some(n) => {
                // looking if n is between 0 and 0xFF (max u8 value)
                if n < 0 || n > 0xFF {
                    Err(format!("Expected a unsigned 8-bit integer."))
                } else {
                    Ok(U8(n as u8))
                }
            }
        }
    }
}

impl From<u8> for U8 {
    fn from(value: u8) -> Self {
        U8(value)
    }
}

impl From<i32> for U8 {
    fn from(value: i32) -> Self {
        U8(value as u8)
    }
}

impl AddAssign<i32> for U8 {
    fn add_assign(&mut self, rhs: i32) {
        let sum: i32 = i32::from(self.0) + rhs;
        self.0 = sum.try_into().unwrap()    // overflow occured
    }
}
impl AddAssign<u8> for U8 {
    fn add_assign(&mut self, rhs: u8) {
        self.0 += rhs
    }
}

impl SubAssign<i32> for U8 {
    fn sub_assign(&mut self, rhs: i32) {
        let sum: i32 = i32::from(self.0) - rhs;
        self.0 = sum.try_into().unwrap()    // overflow occured
    }
}

impl SubAssign<u8> for U8 {
    fn sub_assign(&mut self, rhs: u8) {
        self.0 -= rhs
    }
}