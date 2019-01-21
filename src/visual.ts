/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private $: JQueryStatic;
        private target: HTMLElement;      
        private settings: VisualSettings;
        private _window: any = {};
        private _target: any;
        private hostCustom: IVisualHost;
        private startDate1:string = "1/2/2014"
        private endDate1:string = "1/4/2014"
        private startDate2 :string = "1/7/2014"
        private endDate2:string = "1/8/2014"
        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.hostCustom = options.host;
            if (typeof document !== "undefined") {
                this.$ = (<any>window).jQuery;    
                this._window = <any>window;        
            }
          
        }
        private getAdvancedFilterColumnTarget = (dataView: any): IFilterColumnTarget => {
            let categories: DataViewCategoricalColumn = dataView[0].categorical.categories[0];

            let target: IFilterColumnTarget = {
                table: categories.source.queryName.substr(0, categories.source.queryName.indexOf('.')),
                column: categories.source.displayName
            };

            return target;
        };
        public update(options: VisualUpdateOptions) {
            this._target = this.getAdvancedFilterColumnTarget(options.dataViews);
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            var htmlStr = '<div style="position: relative;display: flex;"><div  style="padding-right:50px"><p><b>Range 1</b></p><p>Start Date : <input type="text" id="startdate1"></p><p>End Date  : <input type="text" id="enddate1"></p></div>'+
            '<div><p><b>Range 2</b></p><p>Start Date : <input type="text" id="startdate2"></p><p>End Date   : <input type="text" id="enddate2"></p></div><p> <input id="submitdate" type="button" value="Submit"/></p></div>';
         this.$(this.target).html(htmlStr);
         
         var that = this;
           $("#startdate1").val(that.startDate1);
           $("#startdate2").val(that.startDate2);
           $("#enddate1").val(that.endDate1);
           $("#enddate2").val(that.endDate2);
         this.$("#submitdate").click(function(){          
          that.startDate1 = $("#startdate1").val().toString();
          that.startDate2 =  $("#startdate2").val().toString();
          that.endDate1 = $("#enddate1").val().toString();
          that.endDate2 = $("#enddate2").val().toString();
          var _filter = [];
           
                if(that.startDate1 == "" || that.endDate1 == ""){
                    alert("Fill Start and End date");
                }else{
                    let filter: IAdvancedFilter = new that._window["powerbi-models"].AdvancedFilter(
                        that._target,
                        "And",
                        {
                            operator: "GreaterThanOrEqual",
                            value: that.startDate1
                                ? new Date(that.startDate1).toJSON()
                                : null
                        },
                        {
                            operator: "LessThanOrEqual",
                            value: that.endDate1
                                ? new Date(that.endDate1).toJSON()
                                : null
                        });
                    let filter1: IAdvancedFilter = new that._window["powerbi-models"].AdvancedFilter(
                        that._target,
                        "And",
                        {
                            operator: "GreaterThanOrEqual",
                            value: that.startDate2
                                ? new Date(that.startDate2).toJSON()
                                : null
                        },
                        {
                            operator: "LessThanOrEqual",
                            value: that.endDate2
                                ? new Date(that.endDate2).toJSON()
                                : null
                        });
                       if(that.startDate2 == "" || that.endDate2 == ""){
                        that.hostCustom.applyJsonFilter(
                           filter,
                            "general",
                            "filter",
                            FilterAction.merge
                        );
                       }else{
                        that.hostCustom.applyJsonFilter(
                           [filter,filter1],
                            "general",
                            "filter",
                            FilterAction.merge
                        );
                      
                       }
                }                
         })
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}