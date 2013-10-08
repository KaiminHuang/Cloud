      data: null,
        postCreate: function () {
            this.inherited(arguments);
            // TODO add custom init here
            this.data = [];
        },

        _createCssClass: function () {
            return this.inherited(arguments) + ' Chart';
        },

//        afterRender: function () {
//            this.inherited(arguments);
//            this.set('data', this._createDummyChart());
//        },
        _setDataAttr: function (data) {
            this.data = data;

            require([
                // TODO move to lib and figure out how to import without errors
                "d3/utils",
                "d3/tooltip",
                "d3/legend",
                "d3/axis",
                'd3/multiBarHorizontalChart',
                "d3/stream_layers",
                "d3/scatter",
                "d3/line",
                "d3/cumulativeLineChart"
            ], lang.hitch(this, function () {
                this.renderChart(this.data);
            }));
        },


        _createDummyChart: function () {
            var originalData = [
                {
                    key: "Target",
                    values: [
                        ['2013-07-05T14:00:00+10:00', 0],
                        ['2013-07-05T15:00:00+10:00', 10],
                        ['2013-07-05T15:00:00+10:00', 0],
                        ['2013-07-05T15:30:00+10:00', 0],
                        ['2013-07-05T16:30:00+10:00', 7],
                        ['2013-07-05T16:30:00+10:00', 0],
                        ['2013-07-05T17:10:00+10:00', 0],
                        ['2013-07-05T18:10:00+10:00', 12],
                        ['2013-07-05T18:10:00+10:00', 0]
                    ]
//                    mean: 250
                },
                {
                    key: "Actual",
                    values: [
                        ['2013-07-05T14:00:00+10:00', 0],
                        ['2013-07-05T14:21:00+10:00', 1],
                        ['2013-07-05T14:49:00+10:00', 5],
                        ['2013-07-05T14:55:00+10:00', 8],
                        ['2013-07-05T15:00:00+10:00', 9],
                        ['2013-07-05T15:00:00+10:00', 0],
                        ['2013-07-05T15:30:00+10:00', 0],
                        ['2013-07-05T16:04:00+10:00', 5],
                        ['2013-07-05T16:30:00+10:00', 8],
                        ['2013-07-05T16:30:00+10:00', 0],
                        ['2013-07-05T17:10:00+10:00', 0],
                        ['2013-07-05T17:50:00+10:00', 7],
                        ['2013-07-05T18:10:00+10:00', 12],
                        ['2013-07-05T18:10:00+10:00', 0]
                    ]
//                    mean: -60
                },
                {
                    key: "Waste",
//                    mean: 125,
                    values: [
                        ['2013-07-05T14:00:00+10:00', 0],
                        ["2013-07-05T15:30:00+10:00", 0],
                        ["2013-07-05T15:40:00+10:00", 1],
                        ["2013-07-05T15:45:00+10:00", 2],
                        ["2013-07-05T15:45:00+10:00", 0],
                        ['2013-07-05T17:10:00+10:00', 0],
                        ['2013-07-05T17:30:00+10:00', 2],
                        ['2013-07-05T17:30:00+10:00', 0],
                        ['2013-07-05T18:10:00+10:00', 0]
                    ]
                },
                {
                    key: "Rework",
                    values: [
                        ['2013-07-05T14:00:00+10:00', 0],
                        ['2013-07-05T17:10:00+10:00', 0],
                        ['2013-07-05T17:39:00+10:00', 0],
                        ['2013-07-05T17:44:00+10:00', 1.5],
                        ['2013-07-05T17:44:00+10:00', 0],
                        ['2013-07-05T18:10:00+10:00', 0]
                    ]
                }
            ];
            return this.dataAdapter(originalData);
        },


        renderChart: function (data, args) {
            // TODO add args

            data = this.dataAdapter(data);

            domConstruct.empty(this.domNode);

            nv.addGraph(lang.hitch(this, function () {
                var chart = nv.models.cumulativeLineChart()
                    .x(function (d) {
                        return d[0]
                    })
                    .y(function (d) {
                        return d[1]
                    })
                    .color(d3.scale.category10().range())
                    .average(function (d) {
                        return d.mean;
                    })
                    .clipVoronoi(true)
                    .showControls(false)
//                    here to change the size of the chart
//                    .width(500)
                    .height(240);

                chart.xAxis
                    .tickFormat(function (d) {
                        return d3.time.format('%H:%M')(new Date(d))
                    });

                chart.yAxis
                    .tickFormat(d3.format(',1'));//',.1%'

                var svg = d3.select(this.domNode).append("svg")
                    .datum(data)
                    .call(chart);
//                    .height(240);

                // TODO(aramk) not sure how to set height - .height() doesn't work - see nvd3 docs
                domStyle.set(svg[0][0], 'height', 240);

                //TODO: Figure out a good way to do this automatically
                nv.utils.windowResize(chart.update);
                chart.dispatch.on('stateChange', function (e) {
                    nv.log('New State:', JSON.stringify(e));
                });
                return chart;
            }));

        },

        //this function turned date from string to int numbers
        dataAdapter: function (data) {
            for (items in data) {
                {
                    for (i in data[items].values) {
                        var stringTime = data[items].values[i][0];
                        var time = new Date(stringTime);
                        var numTime = time.getTime();
                        data[items].values[i][0] = numTime;
                    }
                }
            }
            return data;
        }
    })