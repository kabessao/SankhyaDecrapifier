
const input = document.getElementById('input');
const output = document.getElementById('output');
const filter_empty_values = document.getElementById("filter_empty_values")
const filter_custom_fields = document.getElementById("filter_custom_fields")
const search_field =  document.getElementById("search")


var editor_input = CodeMirror.fromTextArea(input, {
    lineNumbers: true,
    mode: 'text/x-perl',
}
);
var editor_output = CodeMirror.fromTextArea(output, {
    lineNumbers: true,
    mode: 'text/x-perl',
    readOnly: true,
});

function parser() {
  try {
    localStorage.setItem("input", editor_input.getValue())
    jsontext = JSON.parse(editor_input.getValue())

    root = jsontext['responseBody']['entities']
    fields = root['metadata']['fields']['field']
    entities = root['entity']

    names = []

    for (const item of fields) {
      names.push(item["name"])
    }

    list = [] 

    function sort(entity) { 
      sorted_values = {}
      for (let i = 0; i < names.length ; i++) { 
        value = entity['f'+i]
        value = value["$"] ? value["$"] : ""; 

        if (filter_empty_values.checked && (!value || String(value) == "0" )) {
          continue
        }

        if (filter_custom_fields.checked && names[i].startsWith("AD_")) {
          continue
        }

        if (search_field.value)  {
          search_value = search_field.value.toUpperCase()
          name = names[i].toUpperCase()

          if (!(name.includes(search_value)) && !value.toUpperCase().includes(search_value))
          continue
        }

        sorted_values[names[i]] = value
      }

      list.push(sorted_values)
    }

    if (Array.isArray(entities)) {
      for (const entity of entities) {
        sort(entity);
      }
    } else {
      sort(entities);
    }

    editor_output.setValue(JSON.stringify(list, null, 2))

  } catch (error) {
    editor_output.setValue("[ NOT A VALID SANKHYA JSON ]")
  }

  output.value = editor_output.getValue()
}

editor_input.setValue(localStorage.getItem("input") ? localStorage.getItem("input") : "")
parser()
editor_input.on('change', parser);
search_field.addEventListener('input', parser);
filter_empty_values.addEventListener('change', parser)
filter_custom_fields.addEventListener('change', parser)

editor_input.on('blur', function() { editor_input.setValue( JSON.stringify( JSON.parse(editor_input.getValue()), null, 2 ) ) })
