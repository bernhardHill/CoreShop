/*
 * CoreShop.
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */
coreshop.order.order.detail.blocks.detail.prototype.generateItemGrid = function () {

    var _ = this,
        hasAdditionalData = false;
    if (Ext.isArray(this.sale.details)) {
        Ext.Array.each(this.sale.details, function (row) {
            if (row.hasOwnProperty('additional_details')) {
                hasAdditionalData = true;
                return false;
            }
        })
    }


    this.saveQuantity = function () {
        let modifiedRecords =this.detailsStore.getModifiedRecords();
        let payload={};
        payload.id = this.sale.id;
        let pos = -1;



        for (let i=0; i < modifiedRecords.length; i++) {
            this.sale.details.forEach(function (r,index) {
                if (r.o_id === modifiedRecords[i].data.o_id) pos = index;
            },pos);
            if (pos >=0 ) {
                payload['items[' + pos + '][o_id]'] = modifiedRecords[i].data.o_id;
                payload['items[' + pos + '][quantity]'] = modifiedRecords[i].data.quantity;
            }
        }


        Ext.Ajax.request({
            url: Routing.generate('coreshop_admin_order_edit'),
            method: 'POST',
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                this.panel.reload();
                if (this.panel.saveButton) {
                    this.panel.getLayout().getDockedItems()[0].remove(Ext.getCmp('quantity_save_btn_id'),true);
                    this.panel.saveButton=null;
                }
            },

            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            },
            params: payload,
            scope: this
        });
    }

    let rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
        clicksToEdit: 1,
        clicksToMoveEditor: 1,
        listeners: {
            beforeedit: function (editor, context, eOpts) {

                if (pimcore.globalmanager.get('coreshop.order_editable')===false) {
                    return false;
                }
                if (this.sale.orderState.state === 'complete' || this.sale.immutable === true) {
                    return false;
                }
                if (context.record.get('immutable')===true) {
                    return false;
                }

                if (context.field !== 'quantity') {
                    //context.record.set('price', context.record.get('price') / 100);
                    return false;
                }
            },
            afteredit: function (editor, context, eOpts) {
                context.record.set('quantity',context.newValues.quantity);
                if (!this.panel.saveButton) {
                    this.panel.getLayout().getDockedItems()[0].add(
                        this.panel.saveButton = new Ext.button.Button({
                            iconCls: 'pimcore_icon_save',
                            text: t('save'),
                            id: 'quantity_save_btn_id',
                            disabled: false,
                            handler: function () {
                                this.saveQuantity();
                            },
                            scope: this
                        })
                    );
                }








            },
            scope: this
        }
    });
    return {
        xtype: 'grid',
        margin: '0 0 15 0',
        cls: 'coreshop-detail-grid',
        store: this.detailsStore,
        listeners: {
            viewready: function (grid) {
                if (hasAdditionalData === true) {
                    var view = grid.getView(),
                        rowExpander = grid.findPlugin('rowexpander'),
                        store = grid.getStore(), item;
                    for (var i = 0; i <= store.getCount(); i++) {
                        item = store.getAt(i);
                        if (item) {
                            rowExpander.toggleRow(i, item);
                        }
                    }
                    // remove toggle icon
                    view.getHeaderAtIndex(0).hide();
                }
            }
        },
        plugins: hasAdditionalData === true ? [{
            ptype: 'rowexpander',
            expandOnDblClick: false,
            rowBodyTpl: new Ext.XTemplate(
                '<table style="width: 50%;" class="coreshop-item-additional-details">',
                '<tpl for="additional_details">',
                '<tr>',
                '<tpl foreach=".">',
                '<td>',
                '<span>{[ this.formatData(values) ]}</span>',
                '</td>',
                '</tpl>',
                '</tr>',
                '</tpl>',
                '</table>',
                {
                    formatData: function (row) {
                        var label = null, value = null;
                        if (row.type === 'string') {
                            value = row.value;
                        } else if (row.type === 'price') {
                            value = coreshop.util.format.currency(_.sale.baseCurrency.isoCode, row.value)
                        } else {
                            value = '--';
                        }

                        if (row.label !== null) {
                            label = row.translate_label ? t(row.label) : row.label;
                        }

                        return label === null ? value : (label + ': ' + value);
                    }
                }

            )
        },rowEditor]  : [rowEditor],
        columns: [
            {
                xtype: 'gridcolumn',
                flex: 1,
                editable: false,
                dataIndex: 'productName',
                text: t('coreshop_product')
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'priceNet',
                text: t('coreshop_price_without_tax'),
                width: 150,
                align: 'right',
                editable: false,
                renderer: coreshop.util.format.currency.bind(this, this.sale.baseCurrency.isoCode),
                //field: {
                //xtype: 'numberfield',
                //decimalPrecision: pimcore.globalmanager.get('coreshop.currency.decimal_precision')
                //}
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'convertedPriceNet',
                text: t('coreshop_converted_price_without_tax'),
                width: 150,
                align: 'right',
                hidden: this.sale.currency.id === this.sale.baseCurrency.id,
                renderer: coreshop.util.format.currency.bind(this, this.sale.currency.isoCode),
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'price',
                text: t('coreshop_price_with_tax'),
                width: 150,
                align: 'right',
                renderer: coreshop.util.format.currency.bind(this, this.sale.baseCurrency.isoCode)
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'convertedPrice',
                text: t('coreshop_converted_price_with_tax'),
                width: 150,
                align: 'right',
                hidden: this.sale.currency.id === this.sale.baseCurrency.id,
                renderer: coreshop.util.format.currency.bind(this, this.sale.currency.isoCode)
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'quantity',
                text: t('coreshop_quantity'),
                width: 150,
                align: 'right',
                field: {
                    xtype: 'numberfield',
                    decimalPrecision: 0
                }
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'total',
                text: t('coreshop_total'),
                width: 150,
                align: 'right',
                renderer: coreshop.util.format.currency.bind(this, this.sale.baseCurrency.isoCode)
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'convertedTotal',
                text: t('coreshop_converted_total'),
                width: 150,
                align: 'right',
                hidden: this.sale.currency.id === this.sale.baseCurrency.id,
                renderer: coreshop.util.format.currency.bind(this, this.sale.currency.isoCode)
            },
            {
                menuDisabled: true,
                sortable: false,
                xtype: 'actioncolumn',
                width: 50,
                items: this.generateActions()
            }
        ]
    };
};






document.addEventListener(pimcore.events.postOpenObject, (e) => {
    if (pimcore.globalmanager.get("coreshop.order_editable")) {

        if (e.detail.type == "object" && e.detail.object.data.general.o_className == "CoreShopOrderItem") {

            e.detail.object.edit.dataFields.quantity.fieldConfig.noteditable = false;
            e.detail.object.edit.dataFields.quantity.component.setReadOnly(false);
            e.detail.object.edit.dataFields.quantity.component.fieldLabel=e.detail.object.edit.dataFields.quantity.component.fieldLabel.replace(/<\/?[^>]+(>|$)/g, "");

            //e.detail.object.edit.dataFields.quantity.component.on('change', function (f, v) {
            //}, e.detail.object);
            e.detail.object.save = function (task, only, callback, successCallback) {
                var omitMandatoryCheck = false;

                if (task == "version" || task == "unpublish" || task == "autoSave") {
                    omitMandatoryCheck = true;
                }
                var saveData = this.getSaveData(only, omitMandatoryCheck);
                if (saveData && saveData.data != false && saveData.data != "false") {
                    let payload = {};
                    payload.id = this.data.data.order.id;
                    let pos = parseInt(this.tabPanel.activeTab.getTitle())-1;
                    if (pos >= 0) {
                        payload['items[' + pos + '][o_id]'] = saveData.id;
                        payload['items[' + pos + '][quantity]'] = this.edit.dataFields.quantity.getValue();
                    }
                    Ext.Ajax.request({
                        url: Routing.generate('coreshop_admin_order_edit'),
                        method: 'POST',
                        success: function (response, opts) {

                            pimcore.helpers.showNotification(t("success"), t("saved_successfully"), "success");
                            this._allowDirtyClose=true;
                            this.reload();
                        },

                        failure: function (response, opts) {
                            console.log('server-side failure with status code ' + response.status);
                        },
                        params: payload,
                        scope: this
                    });
                }
            }
        }
    }

});

Ext.Ajax.request({
    url: 'coreshop/order_editables/get-config',
    method: 'get',
    success: function (response) {
        try {
            var res = Ext.decode(response.responseText);
            pimcore.globalmanager.add('coreshop.order_editable', res.order_editable);
        } catch (e) {

        }
    }.bind(this)
});