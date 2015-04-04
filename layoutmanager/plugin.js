/**
    This plugin adds various custom grids using twitter bootstrap grid system.

    TODO allowed content filter should be improved.
**/

'use strict';
(function() {
    CKEDITOR.plugins.add('layoutmanager', {
        requires: 'contextmenu',
        lang: 'en,bg',
        init: function(editor) {
            var allowedFull = 'p a div span h2 h3 h4 h5 h6 section article iframe object embed strong b i em cite pre blockquote small sub sup code ul ol li dl dt dd table thead tbody th tr td img caption mediawrapper br[href,src,target,width,height,colspan,span,alt,name,title,class,id,data-options]{text-align,float,margin}(*);'

            if (typeof editor.config.contentsCss == 'object') {
                editor.config.contentsCss.push(CKEDITOR.getUrl(this.path + 'css/bootstrap.css'));
            } else {
                editor.config.contentsCss = [CKEDITOR.getUrl(this.path + 'css/bootstrap.css')];
            }

            editor.config.contentsCss.push(CKEDITOR.getUrl(this.path + 'css/style.css'));

            CKEDITOR.dialog.add('addLayoutDialog', this.path + 'dialogs/layoutsDialog.js');

            /*
                Global variables
                editor.plugins.layoutmanager.tranformLayout
                editor.plugins.layoutmanager.numberOfLayouts
            */
            editor.plugins.layoutmanager.numberOfLayouts = 0;


            /*
                Commands
            */

            editor.addCommand('showLayoutsDialog',
                new CKEDITOR.dialogCommand('addLayoutDialog', {
                    allowedContent: allowedFull
                }));

            editor.addCommand('showLayoutManagerDialog',
                new CKEDITOR.dialogCommand('manageLayoutDialog', {
                    allowedContent: allowedFull
                }));

            editor.addCommand('removeLayout', {
                exec: function(editor) {
                    var answer = confirm("All data inside the layout will be lost!");
                    if (answer) {
                        editor.plugins.layoutmanager.tranformLayout.element.remove();
                        editor.plugins.layoutmanager.numberOfLayouts -= 1;
                    }
                }
            });




            /*
                Add commands to the  context menu if the selected element is layout
            */
            if (editor.contextMenu) {

                editor.addMenuGroup('LayoutTransform');


                editor.addMenuItem('ManageLayout', {
                    label: 'Manage Layout',
                    //icon: 
                    command: 'showLayoutManagerDialog',
                    group: 'LayoutTransform'
                });

                editor.addMenuItem('RemoveLayout', {
                    label: 'Remove Layout',
                    //icon:
                    command: 'removeLayout',
                    group: 'LayoutTransform'
                })


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

                    if (layoutContainer != undefined) {

                        editor.plugins.layoutmanager.tranformLayout = {
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
}())
