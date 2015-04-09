/**
    This plugin adds various custom layouts using twitter bootstrap grid system.
    Author: Radoslav Petkov
**/

'use strict';

CKEDITOR.plugins.add('layoutmanager', {
    requires: 'contextmenu',
    lang: 'en,bg',
    init: pluginInit

});

/**
 * Config variables
 * config.layoutmanager_loadbootstrap  By default is set to false, otherwise loads the embedded bootstrap style.
 * config.layoutmanager_allowedContent  By default is set to allow all tags.
 * config.layoutmanager_buttonBoxWidth  The width of each layout-preview button in the dialog.
 * config.layoutmanager_removeLayoutMsg The message displayed on the window for confirmation of the remove layout operation.
 */
function pluginInit(editor) {

    var layoutManager = new LayoutManager(editor);
    editor.layoutmanager = {};
    //editor.layoutmanager.numberOfLayouts = 0; / soft-delete -- planned for further implementing if needed

    var allowedContent;

    if (editor.config.layoutmanager_allowedContent) {
        allowedContent = editor.config.layoutmanager_allowedContent();
    } else {
        allowedContent = 'p a div span h2 h3 h4 h5 h6 section article iframe object embed strong b i em cite pre blockquote small sub sup code ul ol li dl dt dd table thead tbody th tr td img caption mediawrapper br[href,src,target,width,height,colspan,span,alt,name,title,class,id,data-options]{text-align,float,margin}(*)';
    }

    if (editor.config.layoutmanager_loadbootstrap) {
        if (typeof editor.config.contentsCss == 'object') {
            editor.config.contentsCss.push(CKEDITOR.getUrl(this.path + 'css/bootstrap.css'));
        } else {
            editor.config.contentsCss = [CKEDITOR.getUrl(this.path + 'css/bootstrap.css')];
        }
    }

    if (typeof editor.config.contentsCss == 'object') {
        editor.config.contentsCss.push(CKEDITOR.getUrl(this.path + 'css/style.css'));
    } else {
        editor.config.contentsCss = [CKEDITOR.getUrl(this.path + 'css/style.css')];
    }

    CKEDITOR.dialog.add('addLayoutDialog', layoutManager.addLayoutDialog);
    CKEDITOR.dialog.add('manageLayoutDialog', layoutManager.manageLayoutDialog);

    editor.addCommand('showLayoutsDialog',
        new CKEDITOR.dialogCommand('addLayoutDialog', {
            allowedContent: allowedContent
        }));

    editor.addCommand('showLayoutManagerDialog',
        new CKEDITOR.dialogCommand('manageLayoutDialog', {
            allowedContent: allowedContent
        }));

    editor.addCommand('removeLayout', {
        exec: function(editor) {
            var msg = "All data inside the layout will be lost!";

            if (editor.config.layoutmanager_removeLayoutMsg) {
                msg = editor.config.layoutmanager_removeLayoutMsg;
            }
            var answer = confirm(msg);
            if (answer) {
                layoutManager.remove();
                //editor.layoutmanager.numberOfLayouts -= 1; //soft - delete -- planned for further implementing if needed
            }
        }
    });

    if (editor.contextMenu) {
        editor.addMenuGroup('LayoutTransform');

        editor.addMenuItem('ManageLayout', {
            label: editor.lang.layoutmanager.manageLayoutMenuLabel,
            //icon: 
            command: 'showLayoutManagerDialog',
            group: 'LayoutTransform'
        });

        editor.addMenuItem('RemoveLayout', {
            label: editor.lang.layoutmanager.removeLayoutMenuLabel,
            //icon:
            command: 'removeLayout',
            group: 'LayoutTransform'
        });

        var activeMenuItems = {};

        activeMenuItems['ManageLayout'] = CKEDITOR.TRISTATE_OFF;
        activeMenuItems['RemoveLayout'] = CKEDITOR.TRISTATE_OFF;

        editor.contextMenu.addListener(function(element) {
            // Gets the parents of the clicked element from closest to furthest
            var elementsTree = element.getParents(true);

            var layoutContainer;
            //Searches in the parents of the clicked element for the closest layout
            for (var i = 0; i < elementsTree.length; i++) {
                if (elementsTree[i].hasClass('layout-container')) {
                    layoutContainer = elementsTree[i];
                    break;
                }
            }
            if (layoutContainer) {
                editor.layoutmanager.selectedLayout = {
                    element: layoutContainer
                }
                return activeMenuItems;
            }
        });
    } else {
        alert('contextmenu plugin required to use all plugin features');
    }

    editor.ui.addButton('LayoutManager', {
        title: editor.lang.layoutmanager.title,
        icon: this.path + 'icons/icon.png',
        command: 'showLayoutsDialog'
    });
}

/*
 *   LayoutManager class implementing all layout functionalities.
 *   Author: Radoslav Petkov
 *
 *   Variables stored into the editor's object:
 *   {ckeditor.dom.element} editor.layoutmanager.selectedLayout.element The selected with the cursor element.
 */
function LayoutManager(editor) {

    var trim = function(str) {
        // removes newline / carriage return
        str = str.replace(/\n/g, "");
        // removes whitespace (space and tabs) before tags
        str = str.replace(/[\t ]+\</g, "<");
        // removes whitespace between tags
        str = str.replace(/\>[\t ]+\</g, "><");
        // removes whitespace after tags
        str = str.replace(/\>[\t ]+$/g, ">");
        return str;
    };

    this.trim = trim;

    /**
     * The button's view should be small representation of the actual layout.
     * In order to accomplish it ckeditor's styles should be overrided by adding hardcoded styles to the elements
     * such as width,height,border and position.
     *
     * @param {integer} columns The count of the columns.
     * @param {integer array}  columnsSizes Holds the size of each column in ratio columnsSizes[i] : 12.
     */
    var createLayoutButtonView = function(columns, columnsSizes) {
        var colWidth = [];
        var boxWidth = 58;

        if (editor.config.layoutmanager_buttonBoxWidth) {
            boxWidth = editor.config.layoutmanager_buttonBoxWidth;
        }

        var seedWidth = ((boxWidth - 2) / 12); // Substracts two pixels for the left and right border

        for (var i = 1; i <= 12; i++) {
            colWidth[i] = (seedWidth * i);
        }

        var html = '<div class="container-fluid">';

        for (var i = 0; i < columns; i++) {
            // If the column is not in the beginning set the border-left to 0.
            // The height of the button is set on 30px.
            html = html.concat('<div style="cursor:pointer;border:1px solid #778899;float:left;position:relative;background:#B0C4DE;text-align:center;height:30px;line-height: 30px;width:' + (colWidth[columnsSizes[i]] - 1) + 'px;' + ((i != 0) ? 'border-left:none' : '') + ' "> ' + '</div>');
        }

        html = html.concat('</div>');
        return {
            "html": html,
            "width": boxWidth
        };
    };

    var createLayoutButton = function(type, template, action) {
        var cols = type.split("/");
        var injectTemplate = {};

        for (var i = 0; i < cols.length; i++) {
            injectTemplate["size" + (i + 1)] = cols[i];
        }

        var button = createLayoutButtonView(cols.length, cols);
        var templateWithInjectedValues = trim(template.output(injectTemplate));

        return {
            type: 'html',
            id: type,
            html: button.html,
            className: " ",
            style: 'width:' + button.width + 'px;',
            onClick: function() {
                action(templateWithInjectedValues);
            }
        };
    };

    this.createLayoutButton = createLayoutButton;

    var generateLayoutObjects = function(onClickAction) {
        var firstRow = [];
        var secondRow = [];
        var thirdRow = [];

        var templateWith1Col = new CKEDITOR.template(
            '<div class="container-fluid layout-container">\
                         <div class="row layout-row" >\
                             <div class="col-xs-{size1} col-sm-{size1} col-md-{size1} col-lg-{size1} layout-column">\
                                <p>content</p>\
                            </div>\
                        </div>\
             </div>'
        );

        var templateWith2Cols = new CKEDITOR.template(
            '<div class="container-fluid layout-container">\
                         <div class="row  layout-row">\
                             <div class="col-xs-{size1} col-sm-{size1} col-md-{size1} col-lg-{size1} layout-column ">\
                                 <p>content</p>\
                             </div>\
                            <div class="col-xs-{size2} col-sm-{size2} col-md-{size2} col-lg-{size2} layout-column">\
                                <p>content</p>\
                            </div>\
                        </div>\
            </div>'
        );

        var templateWith3Cols = new CKEDITOR.template(
            '<div class="container-fluid layout-container">\
                         <div class="row  layout-row">\
                             <div class="col-xs-{size1} col-sm-{size1} col-md-{size1} col-lg-{size1} layout-column">\
                                 <p>content</p>\
                             </div>\
                            <div class="col-xs-{size2} col-sm-{size2} col-md-{size2} col-lg-{size2} layout-column">\
                                <p>content</p>\
                            </div>\
                             <div class="col-xs-{size3} col-sm-{size3} col-md-{size3} col-lg-{size3} layout-column">\
                                <p>content</p>\
                            </div>\
                        </div>\
            </div>'
        );


        var templateWith4Cols = new CKEDITOR.template(
            '<div class="container-fluid layout-container">\
                         <div class="row  layout-row">\
                             <div class="col-xs-{size1} col-sm-{size1} col-md-{size1} col-lg-{size1} layout-column">\
                                 <p>content</p>\
                             </div>\
                            <div class="col-xs-{size2} col-sm-{size2} col-md-{size2} col-lg-{size2} layout-column">\
                                <p>content</p>\
                            </div>\
                             <div class="col-xs-{size3} col-sm-{size3} col-md-{size3} col-lg-{size3} layout-column">\
                                <p>content</p>\
                            </div>\
                             <div class="col-xs-{size4} col-sm-{size4} col-md-{size4} col-lg-{size4} layout-column">\
                                <p>content</p>\
                            </div>\
                        </div>\
            </div>'
        );

        firstRow.push(createLayoutButton("12", templateWith1Col, onClickAction));
        firstRow.push(createLayoutButton("6/6", templateWith2Cols, onClickAction));
        firstRow.push(createLayoutButton("9/3", templateWith2Cols, onClickAction));
        firstRow.push(createLayoutButton("3/9", templateWith2Cols, onClickAction));

        secondRow.push(createLayoutButton("8/4", templateWith2Cols, onClickAction));
        secondRow.push(createLayoutButton("4/8", templateWith2Cols, onClickAction));
        secondRow.push(createLayoutButton("7/5", templateWith2Cols, onClickAction));
        secondRow.push(createLayoutButton("5/7", templateWith2Cols, onClickAction));

        thirdRow.push(createLayoutButton("4/4/4", templateWith3Cols, onClickAction));
        thirdRow.push(createLayoutButton("6/3/3", templateWith3Cols, onClickAction));
        thirdRow.push(createLayoutButton("3/6/3", templateWith3Cols, onClickAction));
        thirdRow.push(createLayoutButton("3/3/6", templateWith3Cols, onClickAction));

        return {
            first: firstRow,
            second: secondRow,
            third: thirdRow
        };
    };

    var createDialogDefinition = function(title, minWidth, minHeight, layouts) {
        return {
            title: title,
            minWidth: minWidth,
            minHeight: minHeight,
            resizable: CKEDITOR.DIALOG_RESIZE_NONE,
            buttons: [CKEDITOR.dialog.cancelButton],
            contents: [{
                id: "dialog",
                elements: [{
                    type: 'hbox',
                    id: "firstRow",
                    children: layouts.first
                }, {
                    type: 'hbox',
                    id: "secondRow",
                    children: layouts.second
                }, {
                    type: 'hbox',
                    id: "thirdRow",
                    children: layouts.third
                }]
            }]
        };
    };

    var insertLayoutIntoEditorAction = function(template) {
        var layoutElement = CKEDITOR.dom.element.createFromHtml(template);
        // editor.plugins.layoutmanager.numberOfLayouts += 1; // soft-delete
        editor.insertElement(layoutElement);
        CKEDITOR.dialog.getCurrent().hide();
    };

    var createLayoutReplacement = function(oldLayout, newLayout) {
        var numberOfColumnsInOldLayout = oldLayout.getChildren().getItem(0).getChildren().count();
        var numberOfColumnsInNewLayout = newLayout.getChildren().getItem(0).getChildren().count();

        var oldLayoutRowElement = oldLayout.getChildren().getItem(0);
        var oldLayoutColElements = oldLayoutRowElement.getChildren();

        var newLayoutRowElement = newLayout.getChildren().getItem(0);
        var newLayoutColElements = newLayoutRowElement.getChildren();

        // Because the initial template may contains contents into its columns , it should be cleared when moving
        // elements from the old layout to the new one.
        var clearColumnContent = function(layoutColElements, columnIndex) {
            var layoutColElementsSize = layoutColElements.getItem(columnIndex).getChildren().count();
            for (var j = 0; j < layoutColElementsSize; j++) {
                layoutColElements.getItem(columnIndex).getChildren().getItem(j).remove();
            }
        };

        if (numberOfColumnsInNewLayout < numberOfColumnsInOldLayout) {
            for (var i = 0; i < numberOfColumnsInNewLayout; i++) {
                clearColumnContent(newLayoutColElements, i);
                oldLayoutColElements.getItem(i).moveChildren(newLayoutColElements.getItem(i));
            }
            // Inserts the last column child into its last sibling
            for (var i = numberOfColumnsInNewLayout; i < numberOfColumnsInOldLayout; i++) {
                oldLayoutColElements.getItem(i).moveChildren(newLayoutColElements.getItem(numberOfColumnsInNewLayout - 1));
            }
        } else {
            //Copies content from old to new
            for (var i = 0; i < numberOfColumnsInOldLayout; i++) {
                clearColumnContent(newLayoutColElements, i);
                oldLayoutColElements.getItem(i).moveChildren(newLayoutColElements.getItem(i));
            }
        }
        return newLayout;
    };

    this.createLayoutReplacement = createLayoutReplacement;

    var replaceCurrentLayoutAction = function(template) {
        var oldLayout = editor.layoutmanager.selectedLayout.element;
        var newEmptyLayout = CKEDITOR.dom.element.createFromHtml(template);
        var newLayout = createLayoutReplacement(oldLayout, newEmptyLayout);
        newLayout.replace(oldLayout);
        CKEDITOR.dialog.getCurrent().hide();
    };

    this.addLayoutDialog = function(editor) {
        var width = 200;
        var height = 100;
        var layouts = generateLayoutObjects(insertLayoutIntoEditorAction);
        return createDialogDefinition(editor.lang.layoutmanager.addLayoutDialogTitle, width, height, layouts);
    };

    this.manageLayoutDialog = function(editor) {
        var width = 200;
        var height = 100;
        var layouts = generateLayoutObjects(replaceCurrentLayoutAction);
        return createDialogDefinition(editor.lang.layoutmanager.manageLayoutDialogTitle, width, height, layouts);
    };

    this.remove = function() {
        editor.layoutmanager.selectedLayout.element.remove();
    };


    /*
        This piece of commented code is probable workaround for the bug related to the removal of 'layout-column'
        because of the editor's default behaviour.
    */

    /*
        var addChangeListeners = function(editor) {
            var elementsList;
            //Another approach
            editor.on('elementsPathUpdate', function(event) {
                elementsList = editor._.elementsPath.list;
            });

            var isOnChangeListenerActive = true;

            var onChange = function(event) {
                //this ends up not working fu, needs a map
                    var currentLayoutsInDOM = editor.document.$.getElementsByClassName("layout-container");
                    for (var i = 0; i < currentLayoutsInDOM.length; i++) {
                        var el = currentLayoutsInDOM[i].innerHTML;
                        var layout = new CKEDITOR.dom.element.createFromHtml(el);
                        var layoutRowElementChildren = layout.getChildren();
                        // var layoutColElements = layoutRowElement.getChildren();
                        var columnCounter = 0;
                        for (var j = 0; j < layoutRowElementChildren.count(); j++) {
                            if (layoutRowElementChildren.getItem(j).getName() == 'div') {

                                columnCounter += 1;
                            }
                        }
                        console.log(columnCounter);
                    }
                    
                //This might be a better approach;
                if (elementsList != undefined) {
                    var currentSelectedColumn;
                    for (var i = 0; i < elementsList.length; i++) {
                        //console.log(elementsList[i]);
                        if (elementsList[i].hasClass('layout-column')) {
                            currentSelectedColumn = elementsList[i];
                            break;
                        }
                    }
                    if (currentSelectedColumn != undefined) {
                        //currentSelectedColumn.appendHtml('');
                        console.log(currentSelectedColumn);
                        if (currentSelectedColumn.getChildCount() == 1) {
                            console.log('vreme e');
                            console.log(currentSelectedColumn.getChild(0));
                        }
                    }

                }

            };
        
            var numberOfLayoutsListener = function(event) {
                // console.log(editor.plugins.layoutmanager.numberOfLayouts);
                if (editor.plugins.layoutmanager.numberOfLayouts <= 0) {
                    isOnChangeListenerActive = false;
                    editor.removeListener('change', onChange);
                    event.stop();
                } else {
                    if (isOnChangeListenerActive == false) {
                        editor.on('change', onChange, null, null, 2);
                        onChange();
                        isOnChangeListenerActive = true;
                    }
                }
            };

            editor.on('change', numberOfLayoutsListener, null, null, 1);
            editor.on('change', onChange, null, null, 2);
    */
}
