use juniper::{graphql_value, DefaultScalarValue, FieldError, IntoFieldError};
use serde::{Deserialize, Serialize};
use serde_json;
use std::fmt;

/// An error returned by any query or mutation of this graphql server.
/// It is readable like json.
#[derive(Debug, Serialize, Deserialize)]
pub struct GraphqlServerError {
    /// The error message.
    pub message: String,
    /// The error code.
    pub code: Code,
}

/// The code of an error.
/// Consists of the code and message that goes with it.
#[derive(Debug, Serialize, Deserialize)]
pub struct Code(u16, String);

// Alias for static codes that will be defined
type StaticCode = (u16, &'static str);

impl From<&StaticCode> for Code {
    fn from(value: &(u16, &str)) -> Self {
        Code(value.0, String::from(value.1))
        // create a new Code copying values from (u16, &str)
    }

    // defined this as want to later define and use static codes
    // which we can then reference to make Code for GraphqlErrors
}

// define some static codes that may be used for our error

/// 400: Bad Request
pub static CODE400: StaticCode = (400, "Bad Request");
/// 404: Not Found
pub static CODE404: StaticCode = (404, "Not Found");
/// 404: Not Found
pub static CODE422: StaticCode = (422, "Unprocessable Content");
/// 500: Internal Server Error
pub static CODE500: StaticCode = (500, "Internal Server Error");

/// an alias for ```Result<T, GraphqlError>```
pub type GraphqlServerResult<T> = Result<T, GraphqlServerError>;

impl GraphqlServerError {
    /// Creates a GraphqlError given ```message``` and a static```code```
    pub fn new(message: String, code: &'static StaticCode) -> GraphqlServerError {
        GraphqlServerError {
            message,
            code: Code::from(code),
        }
    }
}

impl IntoFieldError for GraphqlServerError {
    fn into_field_error(self) -> FieldError<DefaultScalarValue> {
        FieldError::new(self, graphql_value!({}))
        // no values in extensions
    }
}

impl fmt::Display for GraphqlServerError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{}",
            serde_json::to_string_pretty(self)
                .expect("GraphqlError serialization should not fail.")
        )
    }
}

impl std::error::Error for GraphqlServerError {}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn error_output_is_readable() {
        let graphql_error = GraphqlServerError::new("Query returned nothing".to_string(), &CODE404);

        let expected = serde_json::to_string_pretty(&graphql_error).unwrap();
        let actual = format!("{}", graphql_error);
        assert_eq!(expected, actual)
    }
}
