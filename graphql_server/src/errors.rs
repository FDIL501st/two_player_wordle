use std::fmt;

use juniper::{graphql_value, Value};

#[derive(Debug)]
pub struct GraphalError {
    pub message: String,
    pub code: u8,
    pub code_message: String
}

impl GraphalError {
    pub fn new(message: String, code: u8, code_message: String) -> GraphalError {
        GraphalError {
            message,
            code,
            code_message
        }
    }
}

impl fmt::Display for GraphalError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let error_json: Value<String> = graphql_value!({
            "error": self.message.clone(), 
            "code": self.code.to_string(), 
            "message": self.code_message.clone()
        });

        write!(f, "{:#?}", error_json)
    }
}
