/**
    Dialogs
    Author: Radoslav Petkov
 */

(function() {

    function trim(str) {
        // removes newline / carriage return
        str = str.replace(/\n/g, "");
        // remove whitespace (space and tabs) before tags
        str = str.replace(/[\t ]+\</g, "<");
        // remove whitespace between tags
        str = str.replace(/\>[\t ]+\</g, "><");
        // remove whitespace after tags
        str = str.replace(/\>[\t ]+$/g, ">");
        return str;
    }

    /*
        Creates the dialog's layout boxes and appends action on click. 
    */
    function constructLayout(rows, template, editor, action) {

        var colWidth = [];
        var boxWidth = 58;
        var seedWidth = ((boxWidth - 2) / 12); // substract two pixels for left and right border;

        for (var i = 1; i <= 12; i++) {
            colWidth[i] = (seedWidth * i);
        }

        var sizes = rows.split("/");
        var injectTemplate = {};
        var html = '<div class="container-fluid">';
        var generate = "";
        for (var i = 0; i < sizes.length; i++) {
            generate += ('<div style="cursor:pointer;border:1px solid #778899;float:left;position:relative;background:#B0C4DE;text-align:center;height:30px;line-height: 30px;width:' + (colWidth[sizes[i]] - 1) + 'px;' + ((i != 0) ? 'border-left:none' : '') + ' "> ' + '</div>');
            injectTemplate["size" + (i + 1)] = sizes[i];
        }

        html += generate;
        html += '</div>';
        var templateWithInjectedValues = trim(template.output(injectTemplate));

        return {
            type: 'html',
            id: rows,
            html: html,
            className: " ",
            style: 'width:' + boxWidth + 'px;',
            onClick: function() {
                action(editor, templateWithInjectedValues);
            }
        };
    }


    /*
        Construct function that generates the small grid in the dialog and 
        adds the real grid in the field.
    */
    function generateLayoutObjects(editor, action) {
        var firstRow = [];
        var secondRow = [];
        var thirdRow = [];

        var templateWith1Col = new CKEDITOR.template(
            '<div class="container-fluid layout-container">\
                 <div class="row layout-row" >\
                     <div class="col-xs-{size1} col-sm-{size1} col-md-{size1} col-lg-{size1} layout-column">\
                        <div class="layout-column-content" >\
                            <p>content</p>\
                        </div>\
                    </div>\
                </div>\
            </div>'
        );

        var templateWith2Cols = new CKEDITOR.template(
            '<div class="container-fluid layout-container" data-cke-survive="true">\
                 <div class="row  layout-row" data-cke-survive="true">\
                     <div class="col-xs-{size1} col-sm-{size1} col-md-{size1} col-lg-{size1} layout-column " data-cke-survive="true">\
                         <p data-cke-survive="true">content</p>\
                     </div>\
                    <div class="col-xs-{size2} col-sm-{size2} col-md-{size2} col-lg-{size2} layout-column" data-cke-survive="true">\
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


        firstRow.push(constructLayout("12", templateWith1Col, editor, action));
        firstRow.push(constructLayout("6/6", templateWith2Cols, editor, action));
        firstRow.push(constructLayout("9/3", templateWith2Cols, editor, action));
        firstRow.push(constructLayout("3/9", templateWith2Cols, editor, action));

        secondRow.push(constructLayout("8/4", templateWith2Cols, editor, action));
        secondRow.push(constructLayout("4/8", templateWith2Cols, editor, action));
        secondRow.push(constructLayout("7/5", templateWith2Cols, editor, action));
        secondRow.push(constructLayout("5/7", templateWith2Cols, editor, action));

        thirdRow.push(constructLayout("4/4/4", templateWith3Cols, editor, action));
        thirdRow.push(constructLayout("6/3/3", templateWith3Cols, editor, action));
        thirdRow.push(constructLayout("3/6/3", templateWith3Cols, editor, action));
        thirdRow.push(constructLayout("3/3/6", templateWith3Cols, editor, action));



        return {
            first: firstRow,
            second: secondRow,
            third: thirdRow
        };
    }

    /*
        Creates definiton object
    */

    function generateDialogDefinition(title, minWidth, minHeight, layouts) {
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
    }


    /*
        Inserts new layout
    */

    function insertLayoutIntoEditor(editor, template) {
        var layoutElement = CKEDITOR.dom.element.createFromHtml(template);
        editor.plugins.layoutmanager.numberOfLayouts += 1;
        editor.insertElement(layoutElement);
        CKEDITOR.dialog.getCurrent().hide();
    }

    /*
        Replaces the old layout with new one. 
    */

    function replaceCurrentLayout(editor, template) {
        var oldLayout = editor.plugins.layoutmanager.tranformLayout.element;
        var newLayout = CKEDITOR.dom.element.createFromHtml(template);


        var numberOfColumnsInOldLayout = oldLayout.getChildren().getItem(0).getChildren().count();
        var numberOfColumnsInNewLayout = newLayout.getChildren().getItem(0).getChildren().count();

        var oldLayoutRowElement = oldLayout.getChildren().getItem(0);
        var oldLayoutColElements = oldLayoutRowElement.getChildren();


        var newLayoutRowElement = newLayout.getChildren().getItem(0);
        var newLayoutColElements = newLayoutRowElement.getChildren();

        var emptyNewLayout = function(layoutColElements, columnIndex) {
            for (var j = 0; j < layoutColElements.getItem(columnIndex).getChildren().count(); j++) {
                layoutColElements.getItem(columnIndex).getChildren().getItem(j).remove();
            }
        };

        if (numberOfColumnsInNewLayout < numberOfColumnsInOldLayout) {

            for (var i = 0; i < numberOfColumnsInNewLayout; i++) {

                emptyNewLayout(newLayoutColElements, i);
                oldLayoutColElements.getItem(i).moveChildren(newLayoutColElements.getItem(i));

            }
            // insert the last column child into its last sibling
            for (var i = numberOfColumnsInNewLayout; i < numberOfColumnsInOldLayout; i++) {
                oldLayoutColElements.getItem(i).moveChildren(newLayoutColElements.getItem(numberOfColumnsInNewLayout - 1));
            }

        } else {
            //only copy content from old to new

            for (var i = 0; i < numberOfColumnsInOldLayout; i++) {

                emptyNewLayout(newLayoutColElements, i);
                oldLayoutColElements.getItem(i).moveChildren(newLayoutColElements.getItem(i));
            }

        }

        newLayout.replace(oldLayout);
        CKEDITOR.dialog.getCurrent().hide();
    }


    /*
        Dialog used only for adding new layout into the editor
    */

    function addLayoutDialog(editor) {
        var width = 200;
        var height = 100;

        addChangeListeners(editor);

        // Fill dialog with layout templates.
        var layouts = generateLayoutObjects(editor, insertLayoutIntoEditor);

        return generateDialogDefinition(editor.lang.layoutmanager.dialogTitle, width, height, layouts);
    }


    /*
        Dialog used for replacing an old layout with new one
    */

    function manageLayoutDialog(editor) {
        var width = 200;
        var height = 100;

        var layouts = generateLayoutObjects(editor, replaceCurrentLayout);

        return generateDialogDefinition(editor.lang.layoutmanager.dialogTitle, width, height, layouts);
    }

    function addChangeListeners(editor) {
        var isOnChangeListenerActive = true;
        var onChange = function(event) {

            //this ends up not working fu

            var currentLayoutsInDOM = editor.document.$.getElementsByClassName("layout-container");
            // console.log(currentLayoutsInDOM[0]);
            //console.log(currentLayoutsInDOM[1]);
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
    }

    CKEDITOR.dialog.add('addLayoutDialog', addLayoutDialog);
    CKEDITOR.dialog.add('manageLayoutDialog', manageLayoutDialog);

}())
