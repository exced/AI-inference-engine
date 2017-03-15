function* lexer(text) {
    var tokenRegexp = /[A-Za-z_]+|:\-|[()\.,]/g;
    var match;
    while ((match = tokenRegexp.exec(text)) !== null) {
        yield match[0];
    }
}
