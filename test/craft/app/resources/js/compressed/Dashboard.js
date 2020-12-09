!function($){Craft.Dashboard=Garnish.Base.extend({$grid:null,$widgetManagerBtn:null,widgetTypes:null,grid:null,widgets:null,widgetManager:null,widgetAdminTable:null,widgetSettingsModal:null,init:function(t){this.widgetTypes=t,this.widgets={},this.$widgetManagerBtn=$("#widgetManagerBtn"),this.addListener(this.$widgetManagerBtn,"click","showWidgetManager"),Garnish.$doc.ready($.proxy(function(){this.$grid=$("#main > .padded > .grid"),this.grid=this.$grid.data("grid"),$("#newwidgetmenubtn").data("menubtn").menu.on("optionselect",$.proxy(this,"handleNewWidgetOptionSelect"))},this))},getTypeInfo:function(t,i,e){return i?void 0===this.widgetTypes[t][i]?e:this.widgetTypes[t][i]:this.widgetTypes[t]},handleNewWidgetOptionSelect:function(e){var $option=$(e.selectedOption),type=$option.data("type"),settingsNamespace="newwidget"+Math.floor(1e9*Math.random())+"-settings",settingsHtml=this.getTypeInfo(type,"settingsHtml","").replace(/__NAMESPACE__/g,settingsNamespace),settingsJs=this.getTypeInfo(type,"settingsJs","").replace(/__NAMESPACE__/g,settingsNamespace),$gridItem=$('<div class="item" data-colspan="1" style="display: block">'),$container=$('<div class="widget new loading-new scaleout '+type.toLowerCase()+'" data-type="'+type+'"><div class="front"><div class="pane"><div class="spinner body-loading"/><div class="settings icon hidden"/><h2/><div class="body"/></div></div><div class="back"><form class="pane"><input type="hidden" name="type" value="'+type+'"/><input type="hidden" name="settingsNamespace" value="'+settingsNamespace+'"/><h2>'+Craft.t("{type} Settings",{type:Craft.escapeHtml($option.data("name"))})+'</h2><div class="settings"/><hr/><div class="buttons clearafter"><input type="submit" class="btn submit" value="'+Craft.t("Save")+'"/><div class="btn" role="button">'+Craft.t("Cancel")+'</div><div class="spinner hidden"/></div></form></div></div>').appendTo($gridItem);settingsHtml?$container.addClass("flipped"):$container.addClass("loading");var widget=new Craft.Widget($container,settingsHtml.replace(/__NAMESPACE__/g,settingsNamespace),function(){eval(settingsJs)});if(this.grid.$items.length?$gridItem.insertAfter(this.grid.$items.last()):$gridItem.prependTo(this.grid.$container),this.grid.addItems($gridItem),Garnish.scrollContainerToElement($gridItem),$container.removeClass("scaleout"),!settingsHtml){var data={type:type};Craft.postActionRequest("dashboard/createWidget",data,function(t,i){"success"==i&&t.success?($container.removeClass("loading"),widget.update(t)):widget.destroy()})}},showWidgetManager:function(){if(this.widgetManager)this.widgetManager.show();else{for(var t=this.$grid.find("> .item > .widget"),i=$('<form method="post" accept-charset="UTF-8"><input type="hidden" name="action" value="widgets/saveWidget"/></form>').appendTo(Garnish.$bod),e=$('<p id="nowidgets"'+(t.length?' class="hidden"':"")+">"+Craft.t("You don’t have any widgets yet.")+"</p>").appendTo(i),s=$('<table class="data'+(t.length?"":" hidden")+'"/>').appendTo(i),n=$("<tbody/>").appendTo(s),a=0;a<t.length;a++){var o=t.eq(a).data("widget");o&&o.id&&o.getManagerRow().appendTo(n)}this.widgetManager=new Garnish.HUD(this.$widgetManagerBtn,i,{hudClass:"hud widgetmanagerhud",onShow:$.proxy(function(){this.$widgetManagerBtn.addClass("active")},this),onHide:$.proxy(function(){this.$widgetManagerBtn.removeClass("active")},this)}),this.widgetAdminTable=new Craft.AdminTable({tableSelector:s,noObjectsSelector:e,sortable:!0,reorderAction:"dashboard/reorderUserWidgets",deleteAction:"dashboard/deleteUserWidget",onReorderObjects:$.proxy(function(t){for(var i,e=0;e<t.length;e++){var s=this.widgets[t[e]];i?s.$gridItem.insertAfter(i.$gridItem):s.$gridItem.prependTo(this.$grid),i=s}this.grid.resetItemOrder()},this),onDeleteObject:$.proxy(function(t){this.widgets[t].destroy()},this)})}}}),Craft.Widget=Garnish.Base.extend({$container:null,$gridItem:null,$front:null,$settingsBtn:null,$title:null,$bodyContainer:null,$back:null,$settingsForm:null,$settingsContainer:null,$settingsSpinner:null,$settingsErrorList:null,id:null,type:null,title:null,totalCols:null,settingsHtml:null,initSettingsFn:null,showingSettings:!1,colspanPicker:null,init:function(t,i,e){this.$container=$(t),this.$gridItem=this.$container.parent(),this.$container.data("widget",this),this.id=this.$container.data("id"),this.type=this.$container.data("type"),this.title=this.$container.data("title"),this.id&&(window.dashboard.widgets[this.id]=this),this.$front=this.$container.children(".front"),this.$settingsBtn=this.$front.find("> .pane > .icon.settings"),this.$title=this.$front.find("> .pane > h2"),this.$bodyContainer=this.$front.find("> .pane > .body"),this.setSettingsHtml(i,e),this.$container.hasClass("flipped")?(this.initBackUi(),this.refreshSettings(),this.onShowBack()):this.onShowFront(),this.addListener(this.$settingsBtn,"click","showSettings")},initBackUi:function(){this.$back=this.$container.children(".back"),this.$settingsForm=this.$back.children("form"),this.$settingsContainer=this.$settingsForm.children(".settings");var t=this.$settingsForm.children(".buttons");this.$settingsSpinner=t.children(".spinner"),this.addListener(t.children(".btn:nth-child(2)"),"click","cancelSettings"),this.addListener(this.$settingsForm,"submit","saveSettings")},getColspan:function(){return this.$gridItem.data("colspan")},setColspan:function(t){this.$gridItem.data("colspan",t),window.dashboard.grid.refreshCols(!0)},getTypeInfo:function(t,i){return window.dashboard.getTypeInfo(this.type,t,i)},setSettingsHtml:function(t,i){this.settingsHtml=t,this.initSettingsFn=i,this.settingsHtml?this.$settingsBtn.removeClass("hidden"):this.$settingsBtn.addClass("hidden")},refreshSettings:function(){this.$settingsContainer.html(this.settingsHtml),Garnish.requestAnimationFrame($.proxy(function(){Craft.initUiElements(this.$settingsContainer),this.initSettingsFn()},this))},showSettings:function(){this.$back||this.initBackUi(),this.refreshSettings(),this.$container.addClass("flipped").velocity({height:this.$back.height()},{complete:$.proxy(this,"onShowBack")})},hideSettings:function(){this.$container.removeClass("flipped").velocity({height:this.$front.height()},{complete:$.proxy(this,"onShowFront")})},saveSettings:function(t){t.preventDefault(),this.$settingsSpinner.removeClass("hidden");var i=this.$container.hasClass("new")?"dashboard/createWidget":"dashboard/saveWidgetSettings",e=this.$settingsForm.serialize();Craft.postActionRequest(i,e,$.proxy(function(t,i){this.$settingsSpinner.addClass("hidden"),"success"==i&&(this.$settingsErrorList&&(this.$settingsErrorList.remove(),this.$settingsErrorList=null),t.success?(Craft.cp.displayNotice(Craft.t("Widget saved.")),t.info?(this.update(t),this.hideSettings()):this.destroy()):(Craft.cp.displayError(Craft.t("Couldn’t save widget.")),t.errors&&(this.$settingsErrorList=Craft.ui.createErrorList(t.errors).insertAfter(this.$settingsContainer))))},this))},update:function(response){this.title=response.info.title,this.$container.hasClass("new")?(this.id=response.info.id,this.$container.attr("id","widget"+this.id).removeClass("new loading-new"),this.$settingsForm&&this.$settingsForm.prepend('<input type="hidden" name="widgetId" value="'+this.id+'"/>'),window.dashboard.widgets[this.id]=this,window.dashboard.widgetAdminTable&&window.dashboard.widgetAdminTable.addRow(this.getManagerRow())):window.dashboard.widgetAdminTable&&window.dashboard.widgetAdminTable.$tbody.children('[data-id="'+this.id+'"]:first').children("td:nth-child(2)").html(this.getManagerRowLabel()),this.$title.text(this.title),this.$bodyContainer.html(response.info.bodyHtml),response.info.colspan!=this.getColspan()&&(this.setColspan(response.info.colspan),Garnish.scrollContainerToElement(this.$gridItem)),Craft.initUiElements(this.$bodyContainer),Craft.appendHeadHtml(response.headHtml),Craft.appendFootHtml(response.footHtml),this.setSettingsHtml(response.info.settingsHtml,function(){eval(response.info.settingsJs)})},cancelSettings:function(){this.id?this.hideSettings():this.destroy()},onShowFront:function(){this.showingSettings=!1,this.removeListener(this.$back,"resize"),this.addListener(this.$front,"resize","updateContainerHeight")},onShowBack:function(){this.showingSettings=!0,this.removeListener(this.$front,"resize"),this.addListener(this.$back,"resize","updateContainerHeight"),setTimeout($.proxy(function(){this.$settingsForm.find(":focusable:first").trigger("focus")},this),1)},updateContainerHeight:function(){this.$container.height((this.showingSettings?this.$back:this.$front).height())},getManagerRow:function(){var t=$('<tr data-id="'+this.id+'" data-name="'+Craft.escapeHtml(this.title)+'"><td class="widgetmanagerhud-icon">'+this.getTypeInfo("iconSvg")+"</td><td>"+this.getManagerRowLabel()+'</td><td class="widgetmanagerhud-col-colspan-picker thin"></td><td class="widgetmanagerhud-col-move thin"><a class="move icon" title="'+Craft.t("Reorder")+'" role="button"></a></td><td class="thin"><a class="delete icon" title="'+Craft.t("Delete")+'" role="button"></a></td></tr>');return this.colspanPicker=new Craft.WidgetColspanPicker(this,t.find("> td.widgetmanagerhud-col-colspan-picker")),t},getManagerRowLabel:function(){var t=this.getTypeInfo("name");return Craft.escapeHtml(this.title)+(this.title!=t?' <span class="light">('+t+")</span>":"")},destroy:function(){delete window.dashboard.widgets[this.id],this.$container.addClass("scaleout"),this.base(),setTimeout($.proxy(function(){window.dashboard.grid.removeItems(this.$gridItem),this.$gridItem.remove()},this),200)}}),Craft.WidgetColspanPicker=Garnish.Base.extend({widget:null,maxColspan:null,$container:null,$colspanButtons:null,totalGridCols:null,init:function(t,i){this.widget=t,this.$container=$('<div class="colspan-picker"/>').appendTo(i),this.maxColspan=this.widget.getTypeInfo("maxColspan"),this.totalGridCols=window.dashboard.grid.totalCols,this.createColspanButtons(),window.dashboard.grid.on("refreshCols",$.proxy(this,"handleGridRefresh")),this.addListener(this.$container,"mouseover",function(t){$(t.currentTarget).addClass("hover")}),this.addListener(this.$container,"mouseout",function(t){$(t.currentTarget).removeClass("hover")})},handleGridRefresh:function(){this.totalGridCols!=(this.totalGridCols=window.dashboard.grid.totalCols)&&(this.$colspanButtons&&this.$colspanButtons.remove(),this.createColspanButtons())},createColspanButtons:function(){for(var t=this.maxColspan?Math.min(this.maxColspan,this.totalGridCols):this.totalGridCols,i=Math.min(this.widget.getColspan(),t),e=1;e<=t;e++){var s="";e<=i&&(s="active"),e==i&&(s+=(s?" ":"")+"last"),$("<a/>",{title:1==e?Craft.t("1 column"):Craft.t("{num} columns",{num:e}),role:"button",class:s,data:{colspan:e}}).appendTo(this.$container)}this.$colspanButtons=this.$container.children(),this.addListener(this.$colspanButtons,"mouseover",function(t){var i=$(t.currentTarget);i.add(i.prevAll()).addClass("highlight"),i.nextAll().removeClass("highlight")}),this.addListener(this.$colspanButtons,"mouseout",function(t){this.$colspanButtons.removeClass("highlight")}),this.addListener(this.$colspanButtons,"click",$.proxy(function(t){this.setWidgetColspan($.data(t.currentTarget,"colspan"))},this))},setWidgetColspan:function(t){this.$colspanButtons.removeClass("last active");var i=this.$colspanButtons.eq(t-1);i.add(i.prevAll()).addClass("active"),i.addClass("last"),this.widget.setColspan(t),window.dashboard.grid.refreshCols(!0);var e={id:this.widget.id,colspan:t};Craft.postActionRequest("dashboard/changeWidgetColspan",e,function(t,i){"success"==i&&t.success?Craft.cp.displayNotice(Craft.t("Widget saved.")):Craft.cp.displayError(Craft.t("Couldn’t save widget."))})}})}(jQuery);
//# sourceMappingURL=Dashboard.js.map