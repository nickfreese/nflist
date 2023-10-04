(function() {
    window.nf_list = function(s, i = false) {

        var app = {
            items: [],
            s: {
                front_key: false, //the object key to use for the frontend view of the list item
                skip_confirm:false, //setting true allows us to skip the confirm dialog when deleting items
                allow_adding:true,
                template:`<div class="item-value">^^name/^^</div>`,//when rendering objects, we can use a tmeplate to render multiple fields

            },
            id: "___" + Math.random().toString(16).slice(2),

            startFocus:null,

            init: function(s) {
                var _this = this;
                for (key in s) {
                    _this.s[key] = s[key];
                }

                if (i) {
                    _this.push(i);
                }

                _this.fireListCreated();

                return _this;

            },


            //API
            push: function(i) {
                var _this = this;
                if (typeof i === 'string' || i instanceof String || (typeof i === 'object' && !Array.isArray(i))) {
                    _this.items.push(i);
                } else if (Array.isArray(i)) {
                    _this.items.push(...i);
                }
                _this.callReactive(false);
            },

            //runs updates as needed
            callReactive: function(view_update = true) {
                var _this = this;

                if (view_update) {
                    _this.readFromView();
                }
                
                _this.render();
                _this.fireListUpdated();
                if (_this.startFocus) {
                	document.querySelector("#"+_this.id + ` li[data-nf-list="`+_this.startFocus+`"]`).focus();
                }

            },

            readFromView: function() {
                var _this = this;

                var newItems = [];
                var elems = document.querySelectorAll('#' + _this.id + ' li');

                for (var k = 0; k < elems.length; k++) {
                    var item = JSON.parse(JSON.stringify(_this.items[elems[k].getAttribute("data-nf-list")]));
                    newItems.push(item);
                }

                _this.items = newItems;

            },

            fireListUpdated:function(){
            	let _this = this;

            	const nfListUpdated = new CustomEvent("nflistupdated", {
                    detail: {
               	        list:_this,
              	    },
            	});

            	document.querySelector(_this.s.element).dispatchEvent(nfListUpdated);

            },

            fireListCreated:function(){
            	let _this = this;
 
            	const nfListCreated = new CustomEvent("nflistcreated", {
                    detail: {
               	        list:_this,
              	    },
            	});
                

            	document.querySelector(_this.s.element).dispatchEvent(nfListCreated);

            },

            render: function() {
                var _this = this;

                document.querySelector(_this.s.element).innerHTML = _this.buildListHTML();
                _this.setDraggingListeners();
                _this.setRemoveListeners();
                _this.setEditListeners();
                _this.setNewItemListeners();
                


            },

            buildListHTML: function() {
                var _this = this;

                var html = `<ul id="` + _this.id + `">`;
                for (let i = 0; i < _this.items.length; i++) {

                    if (typeof _this.items[i] === 'object' && _this.items[i] !== null && _this.s.front_key && typeof _this.s.template == "undefined") {
                        html += `<li data-nf-list="` + i + `" ` + _this.getDraggable() + `>` + _this.items[i][_this.s.front_key] + `<button class="edit"></button><button class="remove"></button></li>`;
                    } else if (typeof _this.items[i] === 'object' && _this.items[i] !== null) {
                        html += `<li data-nf-list="` + i + `" ` + _this.getDraggable() + `>` + _this.processTemplate(_this.items[i]) + `<button class="edit"></button><button class="remove"></button></li>`;

                    } else {
                        html += `<li data-nf-list="` + i + `" ` + _this.getDraggable() + `>` + _this.items[i] + `<button class="edit"></button><button class="remove"></button></li>`;
                    }
                }
                html += `</ul>` + _this.buildNewItemHTML() + `<div class="nf-list-edit-modal-container"></div>`;
                return html;

            },

            buildNewItemHTML:function(){

            	var _this = this;
            	if(!_this.s.allow_adding){
                    return "";
            	}

                var html = `<form class="new-list-item">
                    <input type="text" name="new-item-value" /><button class="submit-list-item">Add Item</button>
                    </form>
                `;

                return html;


            },

            getDraggable: function() {
                var _this = this;
                if (_this.s.enable_drag) {
                    return ` draggable="true" `;
                }
                return ``;
            },

            isJsonString: function(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
            },

            setNewItemListeners:function(){
            	let _this = this;

            	if(!_this.s.allow_adding){
                    return false;
            	}

            	const addNew = function(e){
            		e = e || window.e;
            		e.preventDefault();

            		var input = document.querySelector(_this.s.element+` input[name="new-item-value"]`);
            		if (_this.isJsonString(input.value)) {
            			var val = JSON.parse(input.value);
            		    _this.push(val);
            		} else {
                        _this.push(input.value);
            		}
                    

            	};

            	var button = document.querySelector(_this.s.element+" .submit-list-item");
            	button.addEventListener("click", addNew, false);

            },

            setRemoveListeners:function(){
            	var _this = this;

            	const remove = function(e){
            		e == e || window.e;
            		if (_this.s.skip_confirm == true) {
            			this.parentElement.remove();
                        _this.callReactive();
                        return true;
            		}
            		let confirmResult = confirm("Delete Item?");
            		  if (confirmResult == true) {
                          this.parentElement.remove();
                          _this.callReactive();
                      } 
            	};

            	let items = document.querySelectorAll('#' + _this.id + ' li .remove');
                items.forEach(function(item) {
                    item.addEventListener('click', remove, false);
                });

            },

            setEditListeners:function(){
            	var _this = this;

            	const edit = function(e){
            		e == e || window.e;
            		document.querySelector(_this.s.element + " .nf-list-edit-modal-container").innerHTML = _this.buildEditModal(_this.items[this.parentElement.getAttribute("data-nf-list")], this.parentElement.getAttribute("data-nf-list"));
                    _this.setFormListeners();
            	};

            	let items = document.querySelectorAll('#' + _this.id + ' li .edit');
                items.forEach(function(item) {
                    item.addEventListener('click', edit, false);
                });

            },


            setDraggingListeners: function() {
                let _this = this;
                _this.dragSrcEl = null;

                function handleDragStart(e) {
                    this.style.opacity = '0.4';

                    _this.dragSrcEl = this;

                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', this.innerHTML);
                    e.dataTransfer.setData('key', this.getAttribute("data-nf-list"));
                }

                function handleDragOver(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }

                    e.dataTransfer.dropEffect = 'move';

                    return false;
                }

                function handleDragEnter(e) {
                    this.classList.add('over');
                }

                function handleDragLeave(e) {
                    this.classList.remove('over');
                }

                function handleDrop(e) {
                    if (e.stopPropagation) {
                        e.stopPropagation(); // stops the browser from redirecting.
                    }

                    if (_this.dragSrcEl != this) {
                        _this.dragSrcEl.innerHTML = this.innerHTML;
                        _this.dragSrcEl.setAttribute("data-nf-list", this.getAttribute("data-nf-list"))
                        this.innerHTML = e.dataTransfer.getData('text/html');
                        this.setAttribute("data-nf-list", e.dataTransfer.getData('key'));
                    }
                    _this.callReactive();
                    return false;
                }

                function handleDragEnd(e) {
                    this.style.opacity = '1';

                    items.forEach(function(item) {
                        item.classList.remove('over');
                    });
                }


                let items = document.querySelectorAll('#' + _this.id + ' li');
                items.forEach(function(item) {
                    item.addEventListener('dragstart', handleDragStart, false);
                    item.addEventListener('dragenter', handleDragEnter, false);
                    item.addEventListener('dragover', handleDragOver, false);
                    item.addEventListener('dragleave', handleDragLeave, false);
                    item.addEventListener('drop', handleDrop, false);
                    item.addEventListener('dragend', handleDragEnd, false);
                });

            },


            processTemplate:function(context, template = false){
            	var _this = this;

            	var html = template;

            	if (!template) {
            		html = _this.s.template.slice();
            	}

            	for (let key in context) {
              
                    if (!html.includes(`^^`+key+`/^^`)) {
                        continue;
                    }

                    if (typeof context[key] == "string" || typeof context[key] == "number") {
                    //find and replace
                    html = html.replace(new RegExp("\\^\\^"+key+"/\\^\\^", "g"), context[key]);
                    }
                }

                return html;
            },


            buildEditModal:function(obj, i){
            	var _this = this;
            	var html = `<div class="nf-list-modal-outer">
                    <div class="nf-list-modal-inner">
                    
                    <div class="nf-list-modal-content">
                        ^^form/^^
                    </div>
                    </div>
            	</div>`;

            	

            	return _this.processTemplate({"form":_this.buildEditForm(obj, i)}, html);

            },

            buildEditForm:function(obj, i){
            	var _this = this;
            	var html = `<form class="nf-list-edit">`;
            	if (typeof obj == "string" || typeof obj == "number") {

            		html += `<div class="nf-list-edit-field">
            			<textarea name="`+_this.id+`string_value" data-nf-list="`+i+`" ></textarea>
            			</div>`;

            	} else {

            		for (let key in obj) {
            		  if (typeof obj[key] == "string" || typeof obj[key] == "number") {

            			html += `<div class="nf-list-edit-field">
            			<label>`+key+`</label>
            			<textarea name="`+key+`" data-nf-list="`+i+`" ></textarea>
            			</div>`;

            		  }
            	    }

            	}
            	

            	html += `<button class="nf-list-edit-save">Save</button><button class="nf-list-edit-cancel">Cancel</button>
            	</form>`;
            	return html;

            },

            setFormListeners:function(){
            	let _this = this;



                var inputs = document.querySelectorAll(_this.s.element + " .nf-list-edit textarea");
                inputs[0].focus();
                for (let i = 0; i < inputs.length;i++) {

                	if (inputs[i].getAttribute("name") == _this.id+`string_value`) {
                		inputs[i].value = _this.items[inputs[i].getAttribute("data-nf-list")];
                	} else {
                        inputs[i].value = _this.items[inputs[i].getAttribute("data-nf-list")][inputs[i].getAttribute("name")];
                	}
                    
                }



            	document.querySelector(_this.s.element + " .nf-list-edit-save").addEventListener("click", function(e){
            		e = e || window.e;
            		e.preventDefault();
            		var inputs = document.querySelectorAll(_this.s.element + " .nf-list-edit textarea");
            		var last = null;
                    for (let i = 0; i < inputs.length;i++) {

                    	if (inputs[i].getAttribute("name") == _this.id+`string_value`) {

                    		_this.items[inputs[i].getAttribute("data-nf-list")] = inputs[i].value;

                    	} else {
                            _this.items[inputs[i].getAttribute("data-nf-list")][inputs[i].getAttribute("name")] = inputs[i].value;
                    	}

                        last = inputs[i].getAttribute("data-nf-list");
                        
                    }
                    _this.startFocus = last;
                    _this.callReactive(false);

            	}, false);

            	document.querySelector(_this.s.element + " .nf-list-edit-cancel").addEventListener("click", function(e){
            		e = e || window.e;
            		e.preventDefault();
            		document.querySelector(_this.s.element + " .nf-list-edit-modal-container").innerHTML = "";
            	}, false);



            	

            },




        };


        return app.init(s);
    };
})();