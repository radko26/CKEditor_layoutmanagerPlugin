/**
    This plugin adds various custom grids using twitter bootstrap grid system.

    TODO allowed content filter should be improved.

**/
CKEDITOR.plugins.add('layoutmanager', {
    requires: 'contextmenu,widget',
    lang: 'en,bg',
    init: function(editor) {

        editor.addContentsCss(this.path + 'css/style.css');


        CKEDITOR.dialog.add('layoutsDialog', this.path + 'dialogs/layoutsDialog.js');
        //CKEDITOR.dialog.add('manageLayoutsDialog', this.path + 'dialogs/layoutsDialog.js');


        /*
            Commands
        */

        editor.addCommand('showLayoutsDialog',
            new CKEDITOR.dialogCommand('layoutsDialog', {
                allowedContent: 'div[*];span[*]'
            }));

        editor.addCommand('showLayoutManagerDialog',
            new CKEDITOR.dialogCommand('manageLayoutsDialog', {
                allowedContent: 'div[*];span[*]'
            }));



        /*
            Add commands to the  context menu if the selected element is layout
        */
        if (editor.contextMenu) {

            editor.addMenuGroup('LayoutTransform');


            editor.addMenuItem('ManageLayout', {
                label: 'Manage Layout',
                //icon: this.path + 'icons/abbr.png',
                command: 'showLayoutManagerDialog',
                group: 'LayoutTransform'
            });


            var activeMenuItems = {};

            activeMenuItems['ManageLayout'] = CKEDITOR.TRISTATE_OFF;

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

                if (layoutContainer != undefined) {

                    editor.tranformLayout = {
                        element: layoutContainer
                    }

                    return activeMenuItems;
                }
            });

        }



        editor.ui.addButton('LayoutManager', {
            title: editor.lang.layoutmanager.title,
            icon: this.path + 'icons/icon.png',
            command: 'showLayoutsDialog'
        });

    }
});
