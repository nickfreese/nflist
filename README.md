# NF List
- UI component for orderable, editable lists

## Usage

```

nf_list(<settings>[, <items>])

```

### options

 - `skip_confirm` boolean to toggle skipping the confirm dialog when deleting items.  Defaults to `false`
 - `allow_adding` boolean to toggle the add item form.  defaults to `true`
 - `template` when rendering objects, we can use a template to render multiple fields.  Defaults to `<div class="item-value">^^name/^^</div>`
 - `front_key` the object key to use for the frontend view on an object list item instead of using a template. Defaults to `false`


### basic list
```
var list = window.nf_list({
		element:".myList",
		enable_drag:true
	},[
	"first item",
	"second Item",
	"third Item"
	]);
```

### list of objects with custom template

```
var list2 = window.nf_list({
		element:".objectList",
		enable_drag:true,
		template:`<div class="item-value" style="border-bottom:1px solid #e3e3e3">^^name/^^:<code class="item-value-var" style="margin:0;padding:0">^^value/^^</code></div>`,
	},[
	{
		"name":"A list item",
		"value":35
	},
	{
		"name":"zebras",
		"value":87
	},
	{
		"name":"orange",
		"value":768.4
	}
	]);

```

### Events

```
    
    /*
    *  listen for creation of a list.
    */
    document.querySelector(".myList").addEventListener('nflistcreated', function(e){
    	e = e || window.e;
    	console.log("my list was initialized!", e.detail.list);
    });



    /*
    *  listen for updates to your list
    */
    document.querySelector(".myList").addEventListener('nflistupdated', function(e){
    	e = e || window.e;
    	console.log("my list was updated!", e.detail.list);

    	// e.detail.list.push() //this would cause an infinit loop, so don't add items based on updating of the list.
    });

```


### Things this do
- Displays all the items in their order
- Drag and drop to rearrange items
- Provides a form for editing list items
- PRovides a form for adding list items
- Provides a delete button for items
- Fires an event when your list changes
- Supports lists of objects.
- Allows the use of a template to customize the layout of object list items

### Things this don't
 - Support editing of nested objects or lists
 - Support the rendering of nested objects or lists
 - Support the deletion of individual fields from objects
 - Provide data validation 

