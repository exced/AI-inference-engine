/* Vue.config.debug = true; */

var game = new Vue({
    el: '#query',
    data: {
    },
    computed: {
    },
    methods: {
        query: function () {
            query();
        },
    }
});

/* editor */
var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/prolog");
editor.setReadOnly(true);

/* editorQuery */
var editorQuery = ace.edit("editorQuery");
editorQuery.setTheme("ace/theme/chrome");
editorQuery.getSession().setMode("ace/mode/prolog");

function query() {
    var queryText = editorQuery.getValue();
    console.log("QUERYTEXT " + queryText);
}