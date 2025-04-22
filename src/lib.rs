pub mod ast;
pub mod parser;
pub mod interpreter;

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_simple_network() {
        let input = "N";
        let result = parser::parse(input);
        assert!(result.is_ok(), "Failed to parse: {:?}", result.err());
    }
}