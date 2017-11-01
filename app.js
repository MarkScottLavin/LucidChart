/* APP
 * Name: LucidChart
 * version 0.5.4
 * Author: Mark Scott Lavin 
 * License: MIT
 * For Changelog see README.txt
 */

( function () {

/****** DECLARE GLOBAL OBJECT AND VARIABLES ******/

// Top-level Initialization Vars
var container = document.getElementById('visualizationContainer');

var scene = new THREE.Scene;
var entities = {}; // Holds .objects, .lights, .cameras
scene.events = {
	synthetic: {}
	};
scene.hardFramework = function() {
		
	// CAMERAS;
	cameras();
	// RENDERER
	initRenderer();
	
};
scene.softFramework = function() {
	
	// LIGHTS
	lights();
	// AXES
	axes( 300 , true );	
	// MATERIALS
	materials();
};

var utils = {
	entity: { 
		parentEntity: function( name ) {

			var parentObj = new THREE.Object3D();
			parentObj.name = name;
			scene.add( parentObj );
			return parentObj;
		},
		remove: function( name ) {
			
			var entity = scene.getObjectByName( name )	
			scene.remove( entity );
		}
	},
	geometries: {
		fromExternal: {
			load: function( sourceFilePath , sourceFormat ) {
				
				utils.geometries.fromExternal[sourceFormat] ( sourceFilePath ) || function() { console.error ( 'Invalid file source format provided. Must be OBJ or JSON' ) };
				debug.master && debug.externalLoading && console.log ('About to Load all the Geometry' );

			},
			OBJ: function( sourceFilePath ) {  // Example: 'assets/monster.obj'

				var geometry;
				var mesh;

				loader = new THREE.OBJLoader();
						
				debug.master && debug.externalLoading && console.log ('About to call loader.load' );		
						
				loader.load(
					sourceFilePath , function ( object ) { 
					
						debug.master && debug.externalLoading && console.log ('Starting to run loader.load CALLBACK' );
						
						geometry = new THREE.Geometry().fromBufferGeometry( object.children["0"].geometry );
						geometry.computeLineDistances();
									
						mesh = new THREE.Mesh ( geometry );			
						
						debug.master && debug.externalLoading && console.log ( mesh );
						
						scene.events.synthetic.objectFinishedLoading = new CustomEvent('objectFinishedLoading' , { 
							detail : { 
								passedMesh : mesh 
									}
								}
								);
						
						debug.master && debug.externalLoading && console.log ( 'About to dispatch the Finished Loading Event' );
						
						dispatchEvent( scene.events.synthetic.objectFinishedLoading);
						
						debug.master && debug.externalLoading && console.log ( 'Just Dispatched the Finished Loading Event' );
						debug.master && debug.externalLoading && console.log ( scene.events.synthetic.objectFinishedLoading );
						
						debug.master && debug.externalLoading && console.log ('Done running loader.load CALLBACK' );		
					
						}	);
				
				debug.master && debug.externalLoading && console.log ('Done calling loader.load' );
			},
			JSON: function( sourceFilePath ) {  // Example: 'assets/monster.JSON'

				var loader = new THREE.JSONLoader();
						
				loader.load(
					sourceFilePath , function ( object ) { return( object ); }	);
			}
		},
		mutate: function() {
			
			entities.geometries.dynamic.sphere = new THREE.SphereGeometry( 3, 24, 24 );
			entities.geometries.dynamic.loadedFromExternal.mutated.lineSphere = new THREE.Line( geo2line(entities.geometries.dynamic.sphere), entities.materials.line.dashed.blue, THREE.linePieces );
			//scene.add( entities.geometries.dynamic.loadedFromExternal.mutated.lineSphere );
			
			debug.master && debug.externalLoading && console.log ('First Geometry Loaded: The Line Sphere' );
			debug.master && debug.externalLoading && console.log ( entities.geometries.dynamic.loadedFromExternal.mutated.lineSphere );

		}
	}		
};


var renderer;

// Debug obj - if debug.master = true, we'll flags what areas o the code to debug.
var debug = { 
	master: true, 
/*	events: true, */
	UI: { /*
		browser: true, 
		mixedReality: true  */ },
/*	externalLoading: true,
	renderer: true,
	lucidChart: true, */
	colorLib: true, 
/*	scene: true, 
	cameras: true, 
	lights: true, 
	axes: true, 
	materials: true, 
	math: true */
};

// lucidChart Entity Initialization
var lucidNode = {
}
var chartSettings = {
	data: {},
	math: {},
	color: {}
};

// UI Initialization
var UI = function( device ) {
	
	UI.sharedStates = {
			thresholdColorsBound: true,
		};
	UI.log = function() {
				console.log( 'UI(): ', UI );
		};
	UI.browser = function() {
		
		var self = UI.browser;
			
			// DATA STATES
		
		self.inputs = {
			data: {
				typeSelect: {	
					input: $('input[name="dataType"]'),
					equation: $('#dataTypeEquation'),
					random: $('#dataTypeRandomHeight')
					},	
				equation: {
					select: $('#equationSelect'),
					text: $('#equationTextBox')
					},
				random: {
					height: {
						min: $('#randomMinHeight'),
						max: $('#randomMaxHeight')	
					}
				},
				range: {
					start: {
						x: $('#xRangeStart'),
						z: $('#zRangeStart')
					},
					end: {
						x: $('#xRangeEnd'),
						z: $('#zRangeEnd')
					}
				},
				count: { 
					x: $('#xCount'),
					z: $('#zCount')
				},
			},
			color: {					
				modeSelect: { 
					input: $('input[name="colorMode"]'),
					random: $('#colorModeRandom'),
					byHeight: $('#colorModeByHeight'),
					mono: $('#colorModeMonoChrome'),
					},
				countRawVal: $('#choosePaletteDepth'),
				mono: $('#monoColor'),
				top: $('#topColor'),
				bottom: $('#bottomColor'),
				gradientSelect: { 
					input: $('input[name="gradientType"]'), 
					twoTone: $('#gradientTwoTone'),
					grayScale: $('#gradientGrayScale'),
					rainbow: $('#gradientRainbow')
					},
				thresh: {
					isOn: {
						input: $('input[name="hasMinMaxColorThreshold"]')
					},
					min: $('#minColorHeight'),
					max: $('#maxColorHeight'),
					colorAbove: $('#colorAboveThreshold'),
					colorBelow: $('#colorBelowThreshold'),
					topAndBottomBound: {
						isTrue: null,
						bind: function() {
							UI.browser.inputs.color.top.change( function() { dispatchLoggedEvent( UI.browser.events.boundTopColorChange );} );		
							UI.browser.inputs.color.bottom.change ( function() { dispatchLoggedEvent( UI.browser.events.boundBottomColorChange ); } );
							
							UI.browser.inputs.color.thresh.colorAbove.click( function( e ) { UI.browser.inputs.color.thresh.topAndBottomBound.confirmUnbind( e ); } );
							UI.browser.inputs.color.thresh.colorBelow.click( function( e ) { UI.browser.inputs.color.thresh.topAndBottomBound.confirmUnbind( e ); } );
						},
						listen: function() {
							addEventListener( 'boundTopColorChange' , UI.browser.inputs.color.thresh.topAndBottomBound.aboveThresh );
							addEventListener( 'boundBottomColorChange' , UI.browser.inputs.color.thresh.colorBelow );
							UI.browser.inputs.color.thresh.topAndBottomBound.isTrue = true;
						},
						unListen: function() {
							removeEventListener( 'boundTopColorChange' , UI.browser.inputs.color.thresh.topAndBottomBound.aboveThresh );
							removeEventListener( 'boundBottomColorChange' , UI.browser.inputs.color.thresh.colorBelow );
							UI.browser.inputs.color.thresh.topAndBottomBound.isTrue = false;
						},
						confirmUnbind: function( e ) {
							if ( UI.sharedStates.thresholdColorsBound ) {
								if (confirm('Changing the Below Min or Above Max colors manually will unbind them from the Top and Bottom Color settings. Proceed?') == true) {
									UI.browser.inputs.color.thresh.topAndBottomBound.unListen();
									UI.sharedStates.thresholdColorsBound = false;
									} 
								else { 
									e.preventDefault();
									} 
							}
							return UI.sharedStates.thresholdColorsBound;
						}						
					}
				}
			},	
			appearanceOptions: {
				barThicknessRawVal: $('#barThickness')
			},
		
			camPos: {
				x: $('#xCamPos'),
				y: $('#yCamPos'),
				z: $('#zCamPos')
			},
			
			updateBtn: document.getElementById('updateBtn')	
		};	
		
		self.fieldsets = {
			data: {
				typeSelect: $('#dataTypeSelect'),
				equationOptions: $('#dataEquationOptions'),
				randomOptions: $('#dataRandomOptions'),
				rangeOptions: $('#dataRange'),
			}, 
			color: {
				modeSelect: $('#colorModeSelect'),
				palette: $('#colorPalette'),
				colorPickers: $('#colorPickers'),
				monoColorPicker: $('#monoColorPicker'),
				byHeightColorPickers: $('#byHeightColorPickers'),
				gradientSelect: $('#colorGradientSelect'),
				heightThresh: $('#colorHeightThresh'),
				threshSettings: $('#threshSettings')
				},
			appearanceOptions: $('#appearanceOptions'),
			campos: $('#cameraPositions'),
		};

		self.setCheckedVal = function( name, selectedValue ) {
		$('input[name="' + name+ '"][value="' + selectedValue + '"]').prop('checked', true);
		};

		self.update = {
			inputs: {
				textAndNum: function() { 

					// Min & Max Height
					self.inputs.data.random.height.min.attr('value',chartSettings.math.minUserSetHeight);
					self.inputs.data.random.height.max.attr('value',chartSettings.math.maxUserSetHeight);
					
					// range.start.x & range.start.z
					self.inputs.data.range.start.x.attr('value', chartSettings.data.range.start.x);
					self.inputs.data.range.start.z.attr('value', chartSettings.data.range.start.z);
					
					
					// range.start.x & range.start.z
					self.inputs.data.range.end.x.attr('value', chartSettings.data.range.end.x);
					self.inputs.data.range.end.z.attr('value', chartSettings.data.range.end.z);
					
					// xCount & zCount
					self.inputs.data.count.x.attr('value', chartSettings.data.count.x());
					self.inputs.data.count.z.attr('value', chartSettings.data.count.z());

					// COLOR
					// min & max height threshold
					self.inputs.color.thresh.min.attr('value', chartSettings.color.thresh.min );
					self.inputs.color.thresh.max.attr('value', chartSettings.color.thresh.max );	
					
				},
				
				slider: function() {
					
					self.inputs.color.countRawVal.val( chartSettings.color.countRawVal );
					
					self.inputs.appearanceOptions.barThicknessRawVal.val( chartSettings.appearanceOptions.barThicknessRawVal );
					
				},

				camPos: function() {
					
					var camera = entities.cameras.perspCamera;
					
					self.inputs.camPos.x.attr('value', camera.position.x);
					self.inputs.camPos.y.attr('value', camera.position.y);
					self.inputs.camPos.z.attr('value', camera.position.z);		
				},

				selectAndText: function() { 
					
					self.inputs.data.equation.select.val( chartSettings.math.demoEquation );

					self.inputs.data.equation.text.html( 'y = ' + lucidChart.math.func.preset.dict( chartSettings.math ).display() || 'null' );

				},

				radioAndCheck: function() { // Formerly "Static"
					
					// DATA
					self.setCheckedVal( 'dataType' , chartSettings.math.dataType );

					// Color Mode
					self.setCheckedVal( 'colorMode' , chartSettings.color.mode );
					
					// Gradient Type
					self.setCheckedVal( 'gradientType' , chartSettings.color.gradientType );
					
					// hasMinMaxColorThreshold
					self.setCheckedVal( 'hasMinMaxColorThreshold' , chartSettings.color.thresh.isOn );
					
				},

				colorPicker: function() { // Formerly "static" 
					
					self.inputs.color.mono.val( '#' + entities.materials.hexFromChannels ( entities.materials.channelDecToHex ( chartSettings.color.monoColor.r ), entities.materials.channelDecToHex ( chartSettings.color.monoColor.g ), entities.materials.channelDecToHex (chartSettings.color.monoColor.b ) ) );
					// Top Color
					self.inputs.color.top.val( '#' + entities.materials.hexFromChannels ( entities.materials.channelDecToHex ( chartSettings.color.twoToneStops.top.r ), entities.materials.channelDecToHex ( chartSettings.color.twoToneStops.top.g ), entities.materials.channelDecToHex (chartSettings.color.twoToneStops.top.b ) ) );
					// Bottom Color
					self.inputs.color.bottom.val( '#' + entities.materials.hexFromChannels ( entities.materials.channelDecToHex ( chartSettings.color.twoToneStops.bottom.r ), entities.materials.channelDecToHex ( chartSettings.color.twoToneStops.bottom.g ), entities.materials.channelDecToHex (chartSettings.color.twoToneStops.bottom.b ) ) );
					// colorAboveThreshold
					self.inputs.color.thresh.colorAbove.val( '#' + entities.materials.hexFromChannels ( entities.materials.channelDecToHex ( chartSettings.color.thresh.colorAbove.r ), entities.materials.channelDecToHex ( chartSettings.color.thresh.colorAbove.g ), entities.materials.channelDecToHex (chartSettings.color.thresh.colorAbove.b ) ) );
					// colorBelowThreshold
					self.inputs.color.thresh.colorBelow.val( '#' + entities.materials.hexFromChannels ( entities.materials.channelDecToHex ( chartSettings.color.thresh.colorBelow.r ), entities.materials.channelDecToHex ( chartSettings.color.thresh.colorBelow.g ), entities.materials.channelDecToHex (chartSettings.color.thresh.colorBelow.b ) ) );

				},
				
				data: {
					dynamicCounts: {
						x: function() { self.inputs.data.count.x.attr ( 'value' , chartSettings.data.count.x()) },
						z: function() { self.inputs.data.count.z.attr ( 'value' , chartSettings.data.count.z()) }
						}
					},
				
				currentStates: function(){
						// Get the initial datatype
						var dataTypeRandom = self.inputs.data.typeSelect.random.is(':checked');
						var dataTypeEquation = self.inputs.data.typeSelect.equation.is(':checked');
						
						// Get the initial colormode
						var colorModeRandom = self.inputs.color.modeSelect.random.is(':checked');
						var colorModeByHeight = self.inputs.color.modeSelect.byHeight.is(':checked');
						var colorModeMono = self.inputs.color.modeSelect.mono.is(':checked');
						
						// Get the initial gradientType
						var gradientTypeTwoTone = self.inputs.color.gradientSelect.twoTone.is(':checked');
						var gradientTypeRainbow = self.inputs.color.gradientSelect.rainbow.is(':checked');
						
						// Get the initial hasThresholds state
						var hasThresholds = self.inputs.color.thresh.isOn.input.is(':checked');
						
						// Conditionally show or hide based on states:
						
						if (dataTypeRandom) {
							self.fieldsets.data.randomOptions.show();
							self.fieldsets.data.equationOptions.hide();
							self.fieldsets.color.heightThresh.hide();		
						};
						
						if (dataTypeEquation) {
							self.fieldsets.data.randomOptions.hide();
							self.fieldsets.data.equationOptions.show();
							
							if (colorModeRandom || colorModeMono){
								self.fieldsets.color.heightThresh.hide();
								}
							else if (colorModeByHeight) {
								self.fieldsets.color.heightThresh.show();
							};
						};
						
						if (colorModeRandom) {
							self.fieldsets.color.gradientSelect.show();
							self.fieldsets.color.palette.show();
							self.fieldsets.color.monoColorPicker.hide();	
							self.fieldsets.color.heightThresh.hide();
							
							if (gradientTypeTwoTone) {
								self.fieldsets.color.byHeightColorPickers.show();
								}
							else if (gradientTypeRainbow) {
								self.fieldsets.color.byHeightColorPickers.hide();						
								};
						};
						
						if (colorModeByHeight) {
							self.fieldsets.color.gradientSelect.show();
							self.fieldsets.color.palette.show();
							self.fieldsets.color.monoColorPicker.hide();	
							self.fieldsets.color.heightThresh.show();
							
							if (gradientTypeTwoTone) {
								self.fieldsets.color.byHeightColorPickers.show();
								}
							else if (gradientTypeRainbow) {
								self.fieldsets.color.byHeightColorPickers.hide();						
								};
						};
						
						if (colorModeMono) {
							self.fieldsets.color.monoColorPicker.show();
							self.fieldsets.color.byHeightColorPickers.hide();
							self.fieldsets.color.gradientSelect.hide();
							self.fieldsets.color.palette.hide();
							self.fieldsets.color.heightThresh.hide();							
						};
						
						var hasThresholdsVisible = self.inputs.color.thresh.isOn.input.is(':visible');						
						
						if (hasThresholds && hasThresholdsVisible) {
							self.fieldsets.color.threshSettings.show();
						}
						else {
							self.fieldsets.color.threshSettings.hide();
						}
					},
				},				

		};

		self.events = function(){
	
			// Update button events
			
			self.inputs.updateBtn.onclick = function() {
				
				var clickedString = 'Update button Clicked'; 
				
				debug.master && debug.UI.browser && console.log ( clickedString );
				
				lucidChart.update();
				var camera = entities.cameras.perspCamera;
				entities.cameras.position.update( camera );
				
			};
			
			// Demo Equation Select change events
			self.inputs.data.equation.select.on( 'change', function () {
				
				chartSettings.math.dataType = 'equation';
				chartSettings.math.demoEquation = document.getElementById('equationSelect').value;
				// Pass the top & bottom colors here too...
				self.update.inputs.selectAndText();
				self.update.inputs.radioAndCheck()
					} 
				);

			// What UI.browser elements Have child fieldsets that show/hide when they're checked or unchecked?
			
			self.inputs.data.typeSelect.input.change(
				function() {
					
					chartSettings.math.dataType = this.value;
					
					if (this.value === 'randomHeight') {
						
						chartSettings.math.demoEquation = this.value;
						
						self.fieldsets.data.randomOptions.fadeIn( 1000 );
						self.fieldsets.data.randomOptions.css( {"background-color": "#fff"} );
						self.fieldsets.data.equationOptions.css( {"background-color": "#ddd"} );
						self.fieldsets.data.equationOptions.fadeOut( 1000 );
						
						// Hide the 'Height Thresh' fieldset
						self.fieldsets.color.heightThresh.css({"background-color":"#ddd"});
						self.fieldsets.color.heightThresh.fadeOut( 1000 );										
					}
					else if (this.value === 'equation') {
						
						if (chartSettings.math.demoEquation !== "randomHeight") {
							self.inputs.data.equation.select.val( chartSettings.math.demoEquation );
						}
						else { 
							chartSettings.math.demoEquation = "Wave";
							self.inputs.data.equation.select.val( chartSettings.math.demoEquation );
						};
						
						self.fieldsets.data.equationOptions.fadeIn( 1000 );
						self.fieldsets.data.equationOptions.css( {"background-color": "#fff"} );
						self.fieldsets.data.randomOptions.css( {"background-color": "#ddd"} );
						self.fieldsets.data.randomOptions.fadeOut( 1000 );
						
						// Conditionally show the 'Height Thresh' fieldset
						var modeByHeight = self.inputs.color.modeSelect.byHeight.is(':checked');
						var gradientTwoTone = self.inputs.color.gradientSelect.twoTone.is(':checked');
						var gradientRainbow = self.inputs.color.gradientSelect.rainbow.is(':checked');
						var gradientGrayScale = self.inputs.color.gradientSelect.grayScale.is(':checked');
						
						if ( modeByHeight && ( gradientTwoTone || gradientRainbow || gradientGrayScale )) {
							self.fieldsets.color.heightThresh.fadeIn( 1000 );										
							self.fieldsets.color.heightThresh.css({"background-color":"#fff"});

							if(self.inputs.color.thresh.isOn.input.is(':checked')){
								self.fieldsets.color.threshSettings.fadeIn( 1000 );										
								self.fieldsets.color.threshSettings.css({"background-color":"#fff"});
							};
							
						}
						else {										
							self.fieldsets.color.heightThresh.css({"background-color":"#ddd"});
							self.fieldsets.color.heightThresh.fadeOut( 1000 );							
						}
					};
					
				self.inputs.data.equation.text.html( 'y = ' + lucidChart.math.func.preset.dict( chartSettings.math ).display() || 'null' );
				
				}
			);	
			
			self.inputs.data.range.start.x.change( self.update.inputs.data.dynamicCounts.x() );
			self.inputs.data.range.start.z.change( self.update.inputs.data.dynamicCounts.z() );
			self.inputs.data.range.end.x.change( self.update.inputs.data.dynamicCounts.x() );
			self.inputs.data.range.end.z.change( self.update.inputs.data.dynamicCounts.z() );
				
			
			self.inputs.color.modeSelect.input.change( function(){
				if (this.value === 'randomColor') {
					
					self.fieldsets.color.gradientSelect.fadeIn( 1000 );
					self.fieldsets.color.gradientSelect.css( {"background-color": "#fff"} );
					self.fieldsets.color.palette.fadeIn( 1000 );
					self.fieldsets.color.palette.css( {"background-color": "#fff"} );
					self.fieldsets.color.monoColorPicker.css( {"background-color": "#ddd"} );
					self.fieldsets.color.monoColorPicker.fadeOut( 1000 );	
					self.fieldsets.color.heightThresh.css( {"background-color": '#ddd'} );
					self.fieldsets.color.heightThresh.fadeOut( 1000 );
					
					if ( self.inputs.color.gradientSelect.twoTone.is(':checked')) {
						self.fieldsets.color.byHeightColorPickers.fadeIn( 1000 );
						self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#fff"} );
						}
					else if ( self.inputs.color.gradientSelect.rainbow.is(':checked')) {
						self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#ddd"} );						
						self.fieldsets.color.byHeightColorPickers.fadeOut( 1000 ); 
						};
				}
				
				else if (this.value === 'colorByHeight') {
					
					self.fieldsets.color.gradientSelect.fadeIn( 1000 );
					self.fieldsets.color.gradientSelect.css( {"background-color": "#fff"} );
					self.fieldsets.color.palette.fadeIn( 1000 );
					self.fieldsets.color.palette.css( {"background-color": "#fff"} );
					self.fieldsets.color.monoColorPicker.css( {"background-color": "#ddd"} );
					self.fieldsets.color.monoColorPicker.fadeOut( 1000 );	
					
					if (self.inputs.data.typeSelect.random.is(':checked')) {
						self.fieldsets.color.heightThresh.fadeOut( 1000 );						
						self.fieldsets.color.heightThresh.css( {"background-color": '#ddd'} );
						}
					
					else {
						self.fieldsets.color.heightThresh.css( {"background-color": '#fff'} );
						self.fieldsets.color.heightThresh.fadeIn( 1000 );
	
						if(self.inputs.color.thresh.isOn.input.is(':checked')){
							self.fieldsets.color.threshSettings.fadeIn( 1000 );										
							self.fieldsets.color.threshSettings.css({"background-color":"#fff"});
							};
						};
					
					if ( self.inputs.color.gradientSelect.twoTone.is(':checked')) {
						self.fieldsets.color.byHeightColorPickers.fadeIn( 1000 );
						self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#fff"} );
						}
					else if ( self.inputs.color.gradientSelect.rainbow.is(':checked')) {
						self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#ddd"} );						
						self.fieldsets.color.byHeightColorPickers.fadeOut( 1000 ); 
						};
				}
				
				else if (this.value === 'monochrome') {
					self.fieldsets.color.monoColorPicker.fadeIn( 1000 );
					self.fieldsets.color.monoColorPicker.css( {"background-color": "#fff"} );
					
					self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#ddd"} );
					self.fieldsets.color.byHeightColorPickers.fadeOut( 1000 );
					
					self.fieldsets.color.gradientSelect.css( {"background-color": "#ddd"} );
					self.fieldsets.color.gradientSelect.fadeOut( 1000 );
					
					self.fieldsets.color.palette.css( {"background-color": '#ddd'} );
					self.fieldsets.color.palette.fadeOut( 1000 );
					
					self.fieldsets.color.heightThresh.css( {"background-color": '#ddd'} );
					self.fieldsets.color.heightThresh.fadeOut( 1000 );
				}
			}
			);
			
			self.inputs.color.gradientSelect.input.change( function() {
				
				// hide the monochrome colorpicker
				self.fieldsets.color.monoColorPicker.css( {"background-color": "#ddd"} );
				self.fieldsets.color.monoColorPicker.fadeOut( 1000 );
				
				// conditionally show the 'has threshold' checkbox	
				if ( self.inputs.data.typeSelect.random.is(':checked') || self.inputs.color.modeSelect.random.is(':checked') || self.inputs.color.modeSelect.mono.is(':checked')) {
					self.fieldsets.color.heightThresh.fadeOut( 1000 );
					self.fieldsets.color.heightThresh.css( {"background-color": '#ddd'} );		
				}
				else if ( self.inputs.color.modeSelect.byHeight.is(':checked')) {
					self.fieldsets.color.heightThresh.css( {"background-color": '#fff'} );
					self.fieldsets.color.heightThresh.fadeIn( 1000 );	

					if(self.inputs.color.thresh.isOn.input.is(':checked')){
						self.fieldsets.color.threshSettings.fadeIn( 1000 );										
						self.fieldsets.color.threshSettings.css({"background-color":"#fff"});
					};					
				};
				
				
				if (this.value === 'twoTone'){
					
					// change the activeColorStops value;
					chartSettings.color.palette.activeColorStops = chartSettings.color.twoToneStops;
					
					// show the top/bottom colorpicker						
					self.fieldsets.color.byHeightColorPickers.fadeIn( 1000 );
					self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#fff"} );
				}
				
				else if (this.value === 'rainbow') {

					// change the activeColorStops value;				
					chartSettings.color.palette.activeColorStops = chartSettings.color.rainbowStops;
					
					// hide the top/bottom colorpickers
					self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#ddd"} );						
					self.fieldsets.color.byHeightColorPickers.fadeOut( 1000 ); 
				}
				
				else if (this.value === 'grayScale') {

					// change the activeColorStops value;				
					chartSettings.color.palette.activeColorStops = chartSettings.color.grayScaleStops;
					
					// hide the top/bottom colorpickers
					self.fieldsets.color.byHeightColorPickers.css( {"background-color": "#ddd"} );						
					self.fieldsets.color.byHeightColorPickers.fadeOut( 1000 ); 
				};
			
				// check if the threshold above/below colors are are still bound.					
				if ( UI.browser.inputs.color.thresh.topAndBottomBound.isTrue ) {						
					// if they are still bound, change the above & below thresh colors.	
					chartSettings.color.thresh.setColorsAboveAndBelow();
					// and update the UI.
					self.update.inputs.colorPicker();
				};
			}
			);
			
			self.inputs.data.random.height.min.bind( 'propertychange change keyup input paste' , function(e){
				chartSettings.math.minUserSetHeight = parseInt(self.inputs.data.random.height.min.val());
				self.inputs.data.equation.text.html( 'y = ' + lucidChart.math.func.preset.dict( chartSettings.math ).display() || 'null' ); 
				});  // Noting use of 'bind' works here where 'on' doesn't.
			self.inputs.data.random.height.max.bind( 'propertychange change keyup input paste' , function(e){ 
				chartSettings.math.maxUserSetHeight = parseInt(self.inputs.data.random.height.max.val());
				self.inputs.data.equation.text.html( 'y = ' + lucidChart.math.func.preset.dict( chartSettings.math ).display() || 'null' ); 
				});
			
			self.inputs.color.thresh.isOn.input.change( function(){
				
				if (this.checked) {
					self.fieldsets.color.threshSettings.fadeIn( 1000 );
					self.fieldsets.color.threshSettings.css({"background-color":"#fff"});
				}
				
				else {
					self.fieldsets.color.threshSettings.css({"background-color":"#ddd"});
					self.fieldsets.color.threshSettings.fadeOut( 1000 );										
				};
			});
			
			//GradientSelect
			//Set Min/Max Threshold (Checkbox)
			
				
			// Set Up Events to initialize two possible states for colorAboveThreshold and colorBelowThreshold: 
				//1) If the Top Color changes then the Color Above Threshold changes to match it too.
				//2) We'll always dispatch the event, but if the listener is turned off, no change will happen. 
			self.events.boundTopColorChange = new CustomEvent( 'boundTopColorChange' );
			self.events.boundBottomColorChange = new CustomEvent( 'boundBottomColorChange' );

			UI.browser.inputs.color.thresh.topAndBottomBound.bind();
			UI.browser.inputs.color.thresh.topAndBottomBound.listen();
			
		}
	};
		

	UI.mixedReality = function(){}
	
	// Call the UI for the appropriate device
	UI[device]();
	debug.master && debug[device] && UI.log();
	
};

// Scene Utility Vars
var loader;

// Callback Vars
var loadedMesh = { stub: 'Nothing' };

/****** RUN CODE ******/
document.addEventListener( "DOMContentLoaded", init );

/****** FUNCTION DECLARATIONS ******/

// Initialize the scene: Invoke initialization.

function init() {

	//parseExponentialExpression( '12^10' ); // Just testing the math exponential parser
	
	// Scene Framework
	scene.hardFramework();
	scene.softFramework();

	UI( 'browser' );
	
	// Initialize the chart settings
	lucidChart.init();
	
	// EVENTS
	initEventListeners();
	
	// GEOMETRIES
	initGeometries();
	
	// Create the Stereoscopic viewing object
	var effect = new THREE.StereoEffect(renderer);
		
	debug.master && debug.renderer && console.log ('About to call the render function' );
	render();		  
	debug.master && debug.renderer && console.log ( 'Now Rendering' );
}

function render() {

		requestAnimationFrame( render );
		
		UI.browser.update.inputs.textAndNum();
		UI.browser.update.inputs.camPos();
		
		//entities.geometries.dynamic.loadedFromExternal.mutated.meshAsLineDrawing.rotation.x += 0.03;
		//entities.geometries.dynamic.loadedFromExternal.mutated.meshAsLineDrawing.rotation.y += 0.03;
		//entities.geometries.dynamic.loadedFromExternal.mutated.meshAsLineDrawing.rotation.z += 0.01;
		
		renderer.render(scene, entities.cameras.perspCamera );
	}
	


/****** Event Listeners ******/

function initEventListeners() {
	
	// Event Listeners & Traffic Control
	
	initDOMEvents();
	// Initialize Event listeners for load-complete asynchronous events
	initLoadEvents();
	// Initialize browserUI Events
	UI.browser.events();	
	// Listen for Device Orientation events.
	initControlEvents();
}

function initDOMEvents(){

}

function initLoadEvents() {
	addEventListener('objectFinishedLoading', function (e) { 
		debug.master && debug.externalLoading && console.log ( 'Caught the Custom Event: ' , e.detail.passedMesh ); 
		entities.geometries.dynamic.loadedFromExternal.bufferGeoms.passedMesh = e.detail.passedMesh;
		debug.master && debug.externalLoading && console.log ('Second Geometry Loaded: The Passed Mesh from OBJ', entities.geometries.dynamic.loadedFromExternal.bufferGeoms.passedMesh );
		makeLoadedGeometryLineDrawing( entities.geometries.dynamic.loadedFromExternal.bufferGeoms.passedMesh );
		
		}, false);	
}

function initControlEvents() {
	addEventListener('deviceorientation', setOrientationControls, true);
	
	// Make it fullscreen on click in the window (Not working)
	//addEventListener('click', window.requestFullscreen , false);	
}

/****** INITIALIZE THE SCENE FRAMEWORK *******/

function cameras() {
	
	entities.cameras = {
		perspCamera: new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 ),
		position: {
			init: function( camera ) {
					camera.position.set( 0, 15, -5 );
					camera.lookAt(new THREE.Vector3( 0, 15, 0 ));
					camera.up = new THREE.Vector3( 0,1,0 );
					 debug.master && debug.cameras && console.log ('Camera Position Initialized: ' , camera.position );
			},
			update: function( camera ) {
					
					var newCamPos = {
						x: UI.browser.inputs.camPos.x.val(),
						y: UI.browser.inputs.camPos.y.val(),
						z: UI.browser.inputs.camPos.z.val(),
					};
					
					debug.master && debug.cameras && console.log ('New Camera Position: ' , newCamPos );
					
					camera.position.set( newCamPos.x, newCamPos.y, newCamPos.z );
					
					debug.master && debug.cameras && console.log ('Camera Position Updated: ' , camera.position );
			}
		}
	}
}

function initRenderer() {
	
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.setAttribute( 'id' , 'renderSpace' );
	renderer.domElement.setAttribute( 'class' , 'threeWebGLRenderer' );
	
	container.appendChild( renderer.domElement );
	
}

// if the device we're using has 'alpha' attribute, then it's a mixedReality-compatible mobile browser...
function setOrientationControls(e) {
	if (e.alpha) {
		initVRControls ();
	}
	else {
		initbrowserControls ();
		var camera = entities.cameras.perspCamera;
		entities.cameras.position.init( camera );
	}
}
	
function initbrowserControls() {
	
	// Create the Mouse-Based Controls - Hold down left mouse button and move around the window...
	
	var camera = entities.cameras.perspCamera;
	
	var controls;

	entities.browserControls = new THREE.OrbitControls ( camera , container );
	controls = entities.browserControls;
	
	controls.target.set(
		camera.position.x + 0.15,
		camera.position.y,
		camera.position.z
	);
	
	controls.noPan = true;
	controls.noZoom = true;
}

function initVRControls() {
	
	var camera = entities.cameras.perspCamera;
	var controls;
	
	entities.VRControls = new THREE.DeviceOrientationControls(camera, true);
	controls = entities.VRControls;
	
	controls.connect();
	controls.update();
	
	container.addEventListener( 'click', fullscreen, false);
	container.removeEventListener( 'deviceorientation', setOrientationControls, true);
}

function lights() {
	
	entities.lights = {
		
		pureWhiteLight: new THREE.PointLight(0xffffff, 7, 1000),
		pureWhiteLight2: new THREE.PointLight(0xffffff, 7, 1000),
	};

	entities.lights.pureWhiteLight.position.set(500,500,500);
	entities.lights.pureWhiteLight2.position.set(-500,500,-500);

	scene.add(entities.lights.pureWhiteLight);
	scene.add(entities.lights.pureWhiteLight2);
	
	debug.master && debug.lights && console.log ( 'lights(): ', entities.lights );
}

/* AXES HANDLING */

function axes( extents , rulers ) {
	// Setup the Axes
	
	entities.axes = {
		x: new THREE.Geometry(),
		y: new THREE.Geometry(),
		z: new THREE.Geometry(),
		color: {
			x: 0x880000,
			y: 0x008800,
			z: 0x000088
		},
		lineWidth: 1,
		material: {
				x: new THREE.LineBasicMaterial ({ 
					color: 0x880000,  
					linewidth: 1 }),
				y: new THREE.LineBasicMaterial ({ 
					color: 0x008800,  
					linewidth: 1 }),
				z: new THREE.LineBasicMaterial ({ 
					color: 0x000088,  
					linewidth: 1 })
		},
		rulers: function( axis, extents , spacing ) {
			
			var rulerPoints;
			
			entities.axes.rulers[axis] = new THREE.BufferGeometry();
			
			var positions = new Float32Array( extents * 2 * 3 ); 
			
			for ( var i = 0; i < positions.length; i += 3 ) {	
					
					var currAxPos = -extents + i/3;
					
					if ( axis === 'x' ) {
						positions[i] = currAxPos;
						positions[i + 1] = 0;
						positions[1 + 2] = 0;
					}
					
					if ( axis === 'y' ) {
						positions[i] = 0;
						positions[i + 1] = currAxPos;
						positions[i + 2] = 0;
					}
					
					if ( axis === 'z' ) { 
						positions[i] = 0;
						positions[i + 1] = 0;
						positions[i + 2] = currAxPos;
					}
				}
				
			entities.axes.rulers[axis].addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			entities.axes.rulers[axis].computeBoundingSphere();
			
			var rulerPointMaterial = new THREE.PointsMaterial( { size: 0.1, color: entities.axes.color[axis] } );
			
			rulerPoints = new THREE.Points( entities.axes.rulers[axis], rulerPointMaterial );
			scene.add( rulerPoints );
		},
		draw: function( axis ) {
			
			entities.axes.x.vertices.push(
				new THREE.Vector3( -extents, 0, 0 ),
				new THREE.Vector3( extents, 0, 0 )
			);
			
			entities.axes.y.vertices.push(
				new THREE.Vector3( 0, -extents, 0 ),
				new THREE.Vector3( 0, extents, 0 )
			);
			
			entities.axes.z.vertices.push(
				new THREE.Vector3( 0, 0, -extents ),
				new THREE.Vector3( 0, 0, extents )
			);
			
			// Draw the Axes with their Materials

			var xAxis = new THREE.Line( entities.axes.x, entities.axes.material.x );
			var yAxis = new THREE.Line( entities.axes.y, entities.axes.material.y );
			var zAxis = new THREE.Line( entities.axes.z, entities.axes.material.z );
			
			scene.add( xAxis );
			scene.add( yAxis );
			scene.add( zAxis );
			
			if (rulers === true ) {
				entities.axes.rulers( 'x' , extents, 1 );
				entities.axes.rulers( 'y' , extents, 1 );
				entities.axes.rulers( 'z' , extents, 1 );
			};			
		}
	};
	
	entities.axes.draw();
	
	debug.master && debug.axes && console.log ( 'axes(): ', entities.axes );  
}

/******* COLOR & MATERIALS HANDLING */

function materials() {
	
	entities.materials = {
		hexRGBName: function( r, g, b, a = 1, type ) {			
			var hexRGB = entities.materials.hexFromChannels ( entities.materials.channelDecToHex(r).toString(16) , entities.materials.channelDecToHex(g).toString(16) , entities.materials.channelDecToHex(b).toString(16) ) + '_alpha' + a + '_' + type;
			return hexRGB;
		},
		hexToDec( hexInputString ) {	
			var hexString;
			var colorAsDec = {};
			
			hexString = hexInputString.replace( '#' , '' );
			hexString = hexString.replace( '0x' , '' );
			
			var rHex = hexString.substring(0,2);
			var gHex = hexString.substring(2,4);
			var bHex = hexString.substring(4,6);
			
			colorAsDec.r = parseInt( rHex , 16 );
			colorAsDec.g = parseInt( gHex , 16 );
			colorAsDec.b = parseInt( bHex , 16 );
			
			return colorAsDec; 
		},
		hexFromChannels: function( r, g, b ) {
			
			var hex = r + g + b;
			return hex;
		},
		channelDecToHex: function( channelDecVal ) {
			
			var hex;
			channelDecVal > 0 ? hex = channelDecVal.toString(16) : hex = '00'.toString(16) ; 
			return hex;
		},
		ground: new THREE.MeshBasicMaterial( {color: 0xdddddd, side: THREE.DoubleSide, transparent: true, opacity: 0.5} ),
		line: {
				dashed:{
						red: new THREE.LineDashedMaterial ({ color: 0xff0000, dashSize: .1, gapSize: .1,	linewidth: 3 }),
						blue: new THREE.LineDashedMaterial ({ color: 0x0000ff, dashSize: .1, gapSize: .1, linewidth: 3 }), 
						green: new THREE.LineDashedMaterial ({ color: 0x00ff00, dashSize: .1, gapSize: .1, linewidth: 3 }),
				}
		},
		solid: {
			specularColor: function( channelDecVal, diff = 127 ) {	
					var specColor = channelDecVal - diff;
					specColor > 0 ? specColor : specColor = 0;
					return specColor;				
			},
			phong: {
				load: function( r, g, b, a ) {	
					var hexRGB = entities.materials.hexRGBName( r, g, b, a, 'phong' );
					// Check whether the material already exists. If it does, load it; if not create it.
					var loadMtl = entities.materials[hexRGB] || entities.materials.solid.phong.init( r, g, b, a );
					return loadMtl;
				},
				init: function( r, g, b, a ) {

					var mtlColor = new THREE.Color('rgb(' + r + ',' + g + ',' + b + ')');
					var mtlSpecColor = new THREE.Color(
						'rgb(' + 
						entities.materials.solid.specularColor( r , 127 ) + 
						',' + 
						entities.materials.solid.specularColor( g , 127 ) + 
						',' + 
						entities.materials.solid.specularColor( b , 127 ) + 
						')');
					var hexRGB = entities.materials.hexRGBName( r, g, b, a, 'phong' );
						
					entities.materials[hexRGB] = new THREE.MeshPhongMaterial (
						{
							color: mtlColor,
							specular: mtlSpecColor,
							shininess: 20,
							shading: THREE.FlatShading,
							name: hexRGB 
							} ); 

					debug.master && debug.materials && console.log ( 'Dynamic Material Loaded' , entities.materials[hexRGB] );
					return entities.materials[hexRGB];
				}
			}
		},
		fromColor: function( color, pickBy ){
			
			var pickedColor = color.palette.colorArray[pickBy];
			var material = entities.materials.solid.phong.load( pickedColor.r, pickedColor.g , pickedColor.b );
			
			return material;
			
		}
	};
		
	debug.master && debug.materials && console.log ( 'materials(): ' , entities.materials );
}

/******* GEOMETRIES HANDLING */

function initGeometries() {
	
	entities.geometries = {
		constant: {
			ground: function( xSize = 2000 , zSize = 2000 , heightOffset = -0.001, opacity = 0.5 ) { 
				
				var groundBuffer = new THREE.PlaneBufferGeometry( xSize, zSize, 1 );
				var groundMesh = new THREE.Mesh( groundBuffer , entities.materials.ground );
				
				groundMesh.rotation.x = Math.PI / 2;
				groundMesh.position.y = heightOffset;
				
				scene.add( groundMesh );
			}
		},
		dynamic: {
			loadedFromExternal: {
				bufferGeoms: {},
				mutated: {}
			}
		}
	}
	
	//	Render the Ground
	entities.geometries.constant.ground();

	// Generate the chart	
	lucidChart( chartSettings, 'chart1' );

	// Process the geometries whose load-speed we have control over. The loadedGeometries from external sources we'll handle with the objectFinishedLoading event.
	//utils.geometries.fromExternal.OBJ( 'assets/objects/v4-icosahedron-simplest.obj' );
	//utils.geometries.mutate();
	
}


/****** CREATE THE LUCIDCHART ENTITY ******/

var lucidChart = function( chartSettings, name ) { /* takes chartsettings object as param 1 */

	lucidChart.chartName = name || 'chart1';
	lucidChart.parent = utils.entity.parentEntity( lucidChart.chartName );

	lucidChart.type = {
		bar: function( x, z, yHeight, thickness = 0.5 ) {
		
			var bar = new THREE.BoxGeometry( thickness, yHeight , thickness );
			entities.geometries.dynamic.chart[x][z] = new THREE.Mesh( bar );

			entities.geometries.dynamic.chart[x][z].name = 'lucidChartx' + x + 'z' + z;
			entities.geometries.dynamic.chart[x][z].material = chartSettings.color.func( chartSettings, yHeight );	// Pick the material based on the color function
			entities.geometries.dynamic.chart[x][z].material.side = lucidChart.color.materialSides;
			entities.geometries.dynamic.chart[x][z].castShadow = true;
			entities.geometries.dynamic.chart[x][z].position.x = x;
			entities.geometries.dynamic.chart[x][z].position.y = yHeight/2;
			entities.geometries.dynamic.chart[x][z].position.z = z;
			
			lucidChart.parent.add(entities.geometries.dynamic.chart[x][z]);	
		}
	};	
	
	lucidChart.height = {
		func: chartSettings.math.heightFunc( chartSettings.math ),
		cap: function( yHeight, math ) {	

			var y = yHeight;
			var renderCap = math.renderHeightCap || 9999;
			
			if ( math.renderCapAsApproachesInfinity ) {
				y > renderCap  ?  y = renderCap : false;
				y < -renderCap ?  y = -renderCap : false;
				};
			
			return y;
			},
		generated: {
			getMinAndMax: function( yHeight, math ){
				if ( math.generatedHeight.max === null && math.generatedHeight.min === null ) {
					math.generatedHeight.max = yHeight;
					math.generatedHeight.min = yHeight;
				}	
				else {
					yHeight > math.generatedHeight.max ? math.generatedHeight.max = yHeight : false;
					yHeight < math.generatedHeight.min ? math.generatedHeight.min = yHeight : false;
				}
				return math.generatedHeight;
			},
			reset: function(){
				// Dynamic vars that capture max and min y value generated by the heightFunc;
				chartSettings.math.generatedHeight = {
					min: null,
					max: null
				}
			}
		}
	};
	
	lucidChart.data = {
		mode: {
			update: function() {
				chartSettings.math.dataType = document.querySelector('input[name = "dataType"]:checked').value;   // Get the value of the selected radio button.
				lucidChart.data.mode.renderBy();
			},
			renderBy: function() {
		
				if ( chartSettings.math.dataType === 'randomHeight') {
					
					chartSettings.math.heightFunc = lucidChart.math.func.preset.dict;   // The Math Function dictionary;
					chartSettings.math.demoEquation = 'randomHeight';			// The randomHeight function;
				}
				
				if ( chartSettings.math.dataType === 'equation') {
					
					chartSettings.math.heightFunc = lucidChart.math.func.preset.dict;   // The math Function dictionary;
					chartSettings.math.demoEquation = UI.browser.inputs.data.equation.select.val() || this.demoEquation;	// If using one of the demo equations, the equation select sets which one to use.
				}
			} 
		},
		count: {
			x: chartSettings.data.count.x() || 20, // Default = 20;
			z: chartSettings.data.count.z() || 20  // Default = 20;
		},
		range: {
			start: {
				x: chartSettings.data.range.start.x || 0, // Default = 0 - start at origin
				z: chartSettings.data.range.start.z || 0  // Default = 0 - start at origin
			}	
		}
	};

	
	lucidChart.color = {
		mode: {
			set: function( colorMode ) {
	
				// Choose the colorization function based on UI Selection
				if (colorMode === 'randomColor') { chartSettings.color.func = lucidChart.colorFunc.random; chartSettings.color.hasColorZones = false; }
				if (colorMode === 'colorByHeight') { chartSettings.color.func = lucidChart.colorFunc.byHeight; chartSettings.color.hasColorZones = true; }
				if (colorMode === 'monochrome') { chartSettings.color.func = lucidChart.colorFunc.monoChrome; chartSettings.color.hasColorZones = false; }
			},
			update: function() {	
				chartSettings.color.mode = document.querySelector('input[name = "colorMode"]:checked').value;   // Get the value of the selected radio button.
				lucidChart.color.mode.set( chartSettings.color.mode );	
			}
		},
		gradientType:{
			update: function() {
				chartSettings.color.gradientType = document.querySelector('input[name = "gradientType"]:checked').value;   // Get the value of the selected radio button.	
			}
		},
		materialSides: chartSettings.color.materialSides || THREE.DoubleSide, // Double-sided faces as default	
		heightZones: {
			set: function( chartSettings ) {
				
				var checkIntZeroVal = function( val ) {
					if ( val === 0 ) {
						return parseInt(val);
					}
				};
				
				/* logic from currentStates (refactor later to avoid repeat) */
				var dataTypeRandom = UI.browser.inputs.data.typeSelect.random.is(':checked');
				var dataTypeEquation = UI.browser.inputs.data.typeSelect.equation.is(':checked');
				
				// Get the initial colormode
				var colorModeRandom = UI.browser.inputs.color.modeSelect.random.is(':checked');
				var colorModeByHeight = UI.browser.inputs.color.modeSelect.byHeight.is(':checked');
				var colorModeMono = UI.browser.inputs.color.modeSelect.mono.is(':checked');
				
				// Get the initial gradientType
				var gradientTypeTwoTone = UI.browser.inputs.color.gradientSelect.twoTone.is(':checked');
				var gradientTypeRainbow = UI.browser.inputs.color.gradientSelect.rainbow.is(':checked');
				
				// Get the initial hasThresholds state
				var hasThresholds = UI.browser.inputs.color.thresh.isOn.input.is(':checked');				
								
				var maxThresh, minThresh;
				
				if (dataTypeRandom) {
					maxThresh = chartSettings.math.maxUserSetHeight;
					minThresh = chartSettings.math.minUserSetHeight;
				};
				
				if (dataTypeEquation) {
					if ( hasThresholds 	&& ( 
							chartSettings.color.thresh.max || chartSettings.color.thresh.max === 0 ) 
										&& ( 
							chartSettings.color.thresh.min || chartSettings.color.thresh.min === 0 )
							){
						maxThresh = chartSettings.color.thresh.max;
						minThresh = chartSettings.color.thresh.min;
					}
					else if ( 
							( chartSettings.math.generatedHeight.max || chartSettings.math.generatedHeight.max === 0 ) 
										&& 
							( chartSettings.math.generatedHeight.min || chartSettings.math.generatedHeight.min === 0 )
							){
						maxThresh = chartSettings.math.generatedHeight.max;
						minThresh = chartSettings.math.generatedHeight.min;
					}
					else if (
							( chartSettings.math.maxThreshDefault || chartSettings.math.maxThreshDefault === 0 )
										&& 
							( chartSettings.math.minThreshDefault || chartSettings.math.minThreshDefault === 0 )
							){
						maxThresh = chartSettings.math.maxThreshDefault;
						minThresh = chartSettings.math.minThreshDefault;
					}
					else {
						maxThresh = 0;
						minThresh = 0;
					}
				}
				
								
				var totalColorizeRange = maxThresh - minThresh;
					
				// Update the color.heightZones object
				chartSettings.color.heightZones.totalColorizeRange = totalColorizeRange;
				chartSettings.color.heightZones.count = chartSettings.color.count || 1;   // Set the number of heightZones to colorCount and set a default value if colorCount isn't provided.
				chartSettings.color.heightZones.size = ( totalColorizeRange / chartSettings.color.count );  // size of each zone
				chartSettings.color.heightZones.zone = [];
			 
				// define the heightZones
				
				for ( i = 0; i < chartSettings.color.heightZones.count; i++ ) {

					chartSettings.color.heightZones.zone[ i ] = {};
					chartSettings.color.heightZones.zone[ i ].min = ( i * chartSettings.color.heightZones.size ) + minThresh; // If minThresh=-20 and sizeOfEach=4: [0].min=-20; [1].min=-16; [2].min=-12; [3].min=-8. 
					chartSettings.color.heightZones.zone[ i ].max = ( ( i + 1 ) * chartSettings.color.heightZones.size ) + minThresh; // If minThresh=-20 and sizeOfEach=4: [0].max=-16; [1].max=-12; [2].max=-8;  [3].min=-4.
					
					}
				
				debug.master && debug.lucidChart && console.log( 'lucidChart.color.heightZones.set(): ' ,  chartSettings.color.heightZones );
			},
			clear: function( chartSettings ) {		
				chartSettings.color.heightZones = {
					totalColorizeRange: null,
					count: null,
					size: null,  // size of each zone
					zone: []
				};
				
				debug.master && debug.lucidChart && console.log( 'lucidChart.color.heightZones.set(): ' , chartSettings.color.heightZones );
			}
		},
		minMaxThresh:{
			checkFor: function(){
				
				document.getElementById('hasMinMaxColorThreshold').checked ? chartSettings.color.thresh.isOn = true : chartSettings.color.thresh.isOn = false;
			},
			setVia: {
				UI: function(){
			
					if (chartSettings.color.thresh.isOn === true) {
							chartSettings.color.thresh.min = parseInt(UI.browser.inputs.color.thresh.min.val()) || 0;
							chartSettings.color.thresh.max = parseInt(UI.browser.inputs.color.thresh.max.val()) || 0;
							UI.browser.inputs.color.thresh.min.val( chartSettings.color.thresh.min );
							UI.browser.inputs.color.thresh.max.val( chartSettings.color.thresh.max );
					}
					
					else { lucidChart.color.minMaxThresh.reset(); };
				},
				integration: function( chartSettings ){
				
					if ( ( chartSettings.color.thresh.max || chartSettings.color.thresh.max === 0 ) && ( chartSettings.color.thresh.min  || chartSettings.color.thresh.min === 0 )){
						lucidChart.color.minMaxThresh.setVia.integration.max = chartSettings.color.thresh.max;
						lucidChart.color.minMaxThresh.setVia.integration.min = chartSettings.color.thresh.min;
					}
					else if (( chartSettings.math.generatedHeight.max || chartSettings.math.generatedHeight.max === 0 ) && ( chartSettings.math.generatedHeight.min || chartSettings.math.generatedHeight.max === 0 )) {
						lucidChart.color.minMaxThresh.setVia.integration.max = chartSettings.math.generatedHeight.max;
						lucidChart.color.minMaxThresh.setVia.integration.min = chartSettings.math.generatedHeight.min;
					}
					else if ((  chartSettings.math.randomMaxHeight || chartSettings.math.randomMaxHeight === 0 ) && ( chartSettings.math.randomMinHeight || chartSettings.math.randomMinHeight === 0 )) {
						lucidChart.color.minMaxThresh.setVia.integration.max = chartSettings.math.randomMaxHeight;
						lucidChart.color.minMaxThresh.setVia.integration.min = chartSettings.math.randomMinHeight;
					}
					else if (( chartSettings.math.maxThreshDefault || chartSettings.math.maxThreshDefault === 0 ) && ( chartSettings.math.maxThreshDefault || chartSettings.math.maxThreshDefault === 0 )) {
						lucidChart.color.minMaxThresh.setVia.integration.max = chartSettings.math.maxThreshDefault;  	
						lucidChart.color.minMaxThresh.setVia.integration.min = chartSettings.math.maxThreshDefault;						
					}
					else {
						lucidChart.color.minMaxThresh.setVia.integration.max = 0;
						lucidChart.color.minMaxThresh.setVia.integration.min = 0;
					};
				
				},
			}, 
			reset: function(){

					chartSettings.color.thresh.min = undefined;
					chartSettings.color.thresh.max = undefined;
					UI.browser.inputs.color.thresh.min.val( '' );
					UI.browser.inputs.color.thresh.max.val( '' );
			
			},
			colorOutside: function( chartSettings, yHeight ) {
		
				var x = chartSettings.math.xIterator;
				var z = chartSettings.math.zIterator;
				
				var mtl,				
					colorAboveThreshold,
					colorBelowThreshold;
					
				if ( chartSettings.color.thresh.isOn ){
					
					colorAboveThreshold = chartSettings.color.thresh.colorAbove;
					colorBelowThreshold = chartSettings.color.thresh.colorBelow;
					
					} 
					
				else {
						
					colorAboveThreshold = chartSettings.color.twoToneStops.top;
					colorBelowThreshold = chartSettings.color.twoToneStops.bottom;
						
					};
			
				yHeight >= lucidChart.color.minMaxThresh.setVia.integration.max ? mtl = entities.materials.solid.phong.load ( colorAboveThreshold.r , colorAboveThreshold.g , colorAboveThreshold.b ) : false;
				yHeight <= lucidChart.color.minMaxThresh.setVia.integration.max ? mtl = entities.materials.solid.phong.load ( colorBelowThreshold.r , colorBelowThreshold.g , colorBelowThreshold.b ) : false;
				
				debug.master && debug.colorLib && console.log ( 'Chart Element ( x ', x, ', z', z, ') y = ', yHeight ,' . Out of Range. Assigned Material = ', mtl );
				return mtl;
			}			
		}
	}
	
	entities.geometries.dynamic.chart = [];   // Set up the chart object 
	
	var yHeight;
	
	for (x = lucidChart.data.range.start.x; x < (lucidChart.data.count.x + lucidChart.data.range.start.x); x++) {

		chartSettings.math.xIterator = x;	

		for (z = lucidChart.data.range.start.z; z < (lucidChart.data.count.z + lucidChart.data.range.start.z); z++ ) {
			
			chartSettings.math.zIterator = z;		

			yHeight = lucidChart.height.func.computed( x, z );
			
			// Making sure yHeight isn't an imaginary number before we do anything else. 
			if (!isNaN(yHeight)) {			
				
				// account for the render cap for handling infinities.
				yHeight = lucidChart.height.cap( yHeight, chartSettings.math );  // if render capping is true for elements approaching infinite height, set the cap.
				lucidChart.generatedHeight = lucidChart.height.generated.getMinAndMax( yHeight, chartSettings.math );		// Get the max and min y values generate by the heightFunc thus far.			
				
			}
	}
	}
	
	// lucidChart.color.heightZones.set( chartSettings );
	lucidChart.color.minMaxThresh.setVia.integration( chartSettings );
	chartSettings.color.hasColorZones === true ? lucidChart.color.heightZones.set( chartSettings ) : false;
	
	for (x = lucidChart.data.range.start.x; x < (lucidChart.data.count.x + lucidChart.data.range.start.x); x++) {
		
		entities.geometries.dynamic.chart[x] = [];
		
		chartSettings.math.xIterator = x;
		
		for (z = lucidChart.data.range.start.z; z < (lucidChart.data.count.z + lucidChart.data.range.start.z); z++ ) {
			
			chartSettings.math.zIterator = z;
			
			yHeight = lucidChart.height.func.computed( x, z );
			
			// Making sure that yHeight isn't an imaginary number before continuing.
			if (!isNaN(yHeight)) { 
			
				// apply the height-render cap for infinities.
				yHeight = lucidChart.height.cap( yHeight, chartSettings.math );  
				
				lucidChart.type.bar( x, z, yHeight, chartSettings.appearanceOptions.barThickness );
			}
		
		}
	}
	
	// For Debugging of the Chart;
	debug.master && debug.lucidChart && console.log ( 'lucidChart(): Max Height: ', chartSettings.math.generatedHeight.max, ' Min Height: ' , chartSettings.math.generatedHeight.min );
	debug.master && debug.lucidChart && console.log ( 'lucidChart(): Rendered Chart: ' , entities.geometries.dynamic.chart );
};

// Values passed for lucidChart creation and render on app load.
lucidChart.init = function() {
	
	chartSettings.data = {

			range: {
				start: {
					x: -20,
					z: -20
				},
				end: {
					x: 20,
					z: 20
				}
			},
			count: {
				x: function(){ 					
					return chartSettings.data.range.end.x - chartSettings.data.range.start.x;
				},
				z: function(){
					return chartSettings.data.range.end.z - chartSettings.data.range.start.z;
				}
			}
			};
						
	chartSettings.math = {
			dataType: 'equation',
			heightFunc: lucidChart.math.func.preset.dict,
			demoEquation: "Wave",						// If using one of the demo equations, this sets which to use.
			minUserSetHeight: -5,
			maxUserSetHeight: 5,
			heightRoot: 2,
			exponent: 0.3,
			renderCapAsApproachesInfinity: true, 		// Cap an element if it's height approaches infinity?
			renderHeightCap: 9999, 						// What's the highest/lowest y-Height value to actually render for equations as values approach infinity;
			xIterator: 0, // 							Initialize Passable var for within the loop
			zIterator: 0, // 							Initialize Passable var for within the loop
			generatedHeight: {							// Generated Height will hold maxima and minima later. We're just initializing now.
				min: null,
				max: null
				}
			};
			
	chartSettings.color = {
			mode: 'randomColor',
			func: lucidChart.colorFunc.random,
			countRawVal: 1,
			getCount: function(){
				
				if ( chartSettings.color.countRawVal === 1 ){
					chartSettings.color.count = 11 }
				else if ( chartSettings.color.countRawVal === 2 ){
					chartSettings.color.count = 44 }
				else if ( chartSettings.color.countRawVal === 3 ){
					chartSettings.color.count = 121 }
				else {chartSettings.color.count = 11 };
			},
			monoColor: { 
				r: 255,
				g: 255, 
				b: 255
				},
			twoToneStops: entities.colorLib.stops.preset.twoTone(),
			rainbowStops: entities.colorLib.stops.preset.rainbow(),
			grayScaleStops: entities.colorLib.stops.preset.grayScale(),
			gradientType: 'twoTone',
			palette: { 
				//We'll fill this empty object with values using the entities.colorLib.generate function below.
				activeColorStops: chartSettings.color.twoToneStops
			},
			thresh: {
				isOn: true,
				min: -5,
				max: 5,
				defaultMin: 0,
				defaultMax: 0,
				topAndBottomBound: {
					isTrue: true
				},
				setColorsAboveAndBelow: function(){
					chartSettings.color.thresh.colorBelow = entities.colorLib.stops.get.first( chartSettings.color.palette.activeColorStops );
					chartSettings.color.thresh.colorAbove = entities.colorLib.stops.get.last( chartSettings.color.palette.activeColorStops );
				} 
			},
			materialSides: THREE.DoubleSide, // Which way to have the normals face?
			hasColorZones: false,
			heightZones: {
				size: null,
				totalColorizeRange: null,
				count: null,
				zone: []
			}
	};

	// Get the color count from the raw slider input
	chartSettings.color.getCount();
	
	// Generate the library of colors we'll use based on the present defaults above.
	entities.colorLib.generate( chartSettings ); 
	
	chartSettings.color.thresh.setColorsAboveAndBelow();
	
	chartSettings.appearanceOptions = {
		barThicknessRawVal: 2,
		getBarThickness: function(){
			
			chartSettings.appearanceOptions.barThickness = chartSettings.appearanceOptions.barThicknessRawVal * 0.25; 
		}
	};
	
	chartSettings.appearanceOptions.getBarThickness();
	
	UI.browser.update.inputs.slider();
	UI.browser.update.inputs.radioAndCheck();
	UI.browser.update.inputs.selectAndText();
	UI.browser.update.inputs.colorPicker();
	UI.browser.update.inputs.currentStates();
	
}

// Values collected and passed on user clicking the Update button.
lucidChart.update = function() {
	
	chartSettings.data.range.start.x = parseInt(UI.browser.inputs.data.range.start.x.val()) || 0;
	chartSettings.data.range.start.z = parseInt(UI.browser.inputs.data.range.start.z.val()) || 0; 
//	chartSettings.data.xRangeEnd = ( chartSettings.data.range.start.x + chartSettings.data.count.x );
//	chartSettings.data.zRangeEnd = ( chartSettings.data.range.start.z + chartSettings.data.count.z );
	chartSettings.data.range.end.x = parseInt(UI.browser.inputs.data.range.end.x.val()) || 0;
	chartSettings.data.range.end.z = parseInt(UI.browser.inputs.data.range.end.z.val()) || 0; 
	chartSettings.data.count.x();
	chartSettings.data.count.z();

	lucidChart.data.mode.update();    // Set dynamically interrelated variables.
	
	chartSettings.math.minUserSetHeight = parseInt(UI.browser.inputs.data.random.height.min.val()) || 0;
	chartSettings.math.maxUserSetHeight = parseInt(UI.browser.inputs.data.random.height.max.val()) || 0;
	chartSettings.math.heightRoot = 2;
	chartSettings.math.exponent = 0.3;
	chartSettings.math.renderCapAsApproachesInfinity = true; 		// Cap an element if it's height approaches infinity?
	chartSettings.math.renderHeightCap = 9999;						// What's the highest/lowest y-Height value to actually render for equations as values approach infinity;
	chartSettings.math.xIterator = 0; 								// Initialize Passable var for within the loop
	chartSettings.math.zIterator = 0; 								// Initialize Passable var for within the loop
	
	lucidChart.height.generated.reset();												// Reset the GeneratedHeight Values
	
	lucidChart.color.mode.update();    											// Set dynamically interrelated variables.		
	
	chartSettings.color.countRawVal = parseInt(UI.browser.inputs.color.countRawVal.val()) || 1;	
	chartSettings.color.getCount();
	chartSettings.color.monoColor = entities.materials.hexToDec ( UI.browser.inputs.color.mono.val() );
	chartSettings.color.twoToneStops.top = entities.materials.hexToDec ( UI.browser.inputs.color.top.val() );
	chartSettings.color.twoToneStops.bottom = entities.materials.hexToDec ( UI.browser.inputs.color.bottom.val() );
	
	lucidChart.color.gradientType.update();
	chartSettings.color.thresh.isOn = UI.browser.inputs.color.thresh.isOn.input.is(':checked');
	chartSettings.color.thresh.colorAbove = entities.materials.hexToDec ( UI.browser.inputs.color.thresh.colorAbove.val() );
	chartSettings.color.thresh.colorBelow = entities.materials.hexToDec ( UI.browser.inputs.color.thresh.colorBelow.val() );

	lucidChart.color.minMaxThresh.setVia.UI();	// assign the color thresholds from the browserUI or set them as undefined depending on whether hasMinMaxColorThreshold is checked.
	
	chartSettings.color.materialSides = THREE.DoubleSide; // Which way to have the normals face?

	entities.colorLib.generate( chartSettings );
	
	chartSettings.appearanceOptions.barThicknessRawVal = parseInt(UI.browser.inputs.appearanceOptions.barThicknessRawVal.val()) || 2;
	chartSettings.appearanceOptions.getBarThickness();
	
	debug.master && debug.lucidChart && console.log ( 'chartSettings after lucidChart.update(): ', chartSettings );
	
	utils.entity.remove( 'chart1' );
	
	lucidChart( chartSettings, 'chart1' );
	
	UI.browser.update.inputs.textAndNum();
	UI.browser.update.inputs.slider();
	UI.browser.update.inputs.camPos();
	UI.browser.update.inputs.radioAndCheck();
	UI.browser.update.inputs.selectAndText();
	UI.browser.update.inputs.colorPicker();
}

lucidChart.math = {
	func: {
		preset: { 
			dict: function( math ) {
		
				var selectorString = math.demoEquation || "AsymptoticCrash1";
				
				/* Dictionary of preset functions for generating lucidChart y (height) values and related utilities */					
				var dictionary = {
					"basicQuadratic"   : { 
						computed: 	function( x, z ) { return (Math.pow( x , 2 ) + z ); },
						display: 	function() { return 'x<sup>2</sup> + z'; }			
					},
					"Qbert" : { 
						computed: 	function( x, z ) { return (Math.pow( x , 1.05 )) - (Math.pow( z , 1.05 )); },
						display:	function() { return 'x<sup>1.05</sup> - z<sup>1.05</sup>'; }
					},
					"Precipitous" : {
						computed: 	function( x, z ) { return (Math.pow( x , 0.85 )) - (Math.pow((x * z), ( 0.1 * x ))) + (Math.pow ( z , 1.15 )); },
						display: 	function() { return 'x<sup>0.85</sup> - ( x * z )<sup>( 0.1 * x )</sup> + z<sup>1.15</sup>'; }
					},
					"Rocketing" 		: {						
						computed: 	function( x, z ) { return (Math.pow( x - z , (0.1 * ( x - z)))); },
						display: 	function() { return '( x - z )<sup>( 0.1 * ( x - z ))</sup>'}
					},
					"Wave" 				: {
						computed: 	function( x, z ) { return (Math.pow( x + z , (0.05 * ( x - z)))); },
						display: 	function() { return '( x + z )<sup>(0.05 * ( x - z ))</sup>' }
					},
					"Steppe" 			: {
						computed:	function( x, z ) { return (Math.pow( x , (1/x) ) + Math.pow( z , (1/z) )); },
						display:	function(){ return 'x<sup>( 1 / x )</sup> + z<sup>( 1 / z )</sup>'}
					},
					"Rockslide" 		: {
						computed: 	function( x, z ) { return (Math.pow( x , z/x ) + Math.pow( z , x/z )); },
						display:	function() { return 'x<sup>( z / x )</sup> + z<sup>( x / z )</sup>'  }
					},
					"Waterfall" 		: {
						computed: 	function( x, z ) { return (Math.pow( x , z/x ) + Math.pow( z , 0.3 )); },
						display:	function() { return 'x<sup>( z / x)</sup> + z<sup>0.3</sup>' }
					},
					"AsymptoticCrash1" 	: {
						computed: 	function( x, z ) { return ( x / z ); },
						display:	function() { return 'x / z'}
					},
					"GatesAndWalls" 	: {
						computed: 	function( x, z ) { return (Math.pow( x , ( z / 10 )) + Math.pow( z , ( x / 10 ))); },
						display:	function() { return 'x<sup>( z / 10 )</sup> + z<sup>( x / 10 )</sup>' }
					},
					"AsymptoticCrash2" 	: {
						computed: 	function( x, z ) { return ( (x + ( z / 2 )) / ( z + ( x / 2 )) ); },
						display:	function() { return '( x + ( z / 2 )) / ( z + ( x / 2 ))'}
					},
					"randomHeight"	  	: {
						computed:	function(){ var min = math.minUserSetHeight || 0; // Default 0
												var max = math.maxUserSetHeight || 0; // Default 0 
												var range = max - min;
												return min + range * Math.random();
										},
						display:	function(){ return 'Random: Min cell height = ' + math.minUserSetHeight + ', Max = ' + math.maxUserSetHeight; }
					},
					"minPlusExponent"  : {
						computed: 	function( x, z ) {  var min = math.minUserSetHeight || 0;  // Default 0
														var base = z || 0;  // Default 1
														var exponent = math.exponent || 2;  // Default 2
														var exp = Math.pow( base, exponent );
														return exp || min || 1 ; // return either the product, or if undefined min. If min is also undefined, return 1.
										},
						display:	function() { return 'z<sup>' + math.exponent + '</sup> OR ' + math.minUserSetHeight + ' OR ' + 0 ; 
						}
					}
				};
				
				return dictionary[ selectorString ];			
			},
			parse: function( math ) {
		
				var entire = math.heightFunc( math ).toString();
				var startIndex = '{';
				var lastIndex = ';';
				var removeReturn = 'return ';
				
				var body = entire.substring(entire.indexOf( startIndex ) + 1, entire.lastIndexOf( lastIndex ));
				body = body.replace( removeReturn, '' );   // Remove the return part of the function
				
				return body;	
			}
		}
	}
};

/****** END DYNAMIC DATATYPE HANDLING ******/

/****** DYNAMIC MATERIAL ASSIGNMENT FUNCTIONS ******/

// Color Mode Handling

lucidChart.colorFunc = {
	random: function( chartSettings) {
		var cCount = chartSettings.color.count || 11; // Default 12 Colors
		var rndColorIndex = Math.floor(Math.random() * cCount ); // Pick how many Colors in the Scheme;
		var material = entities.materials.fromColor( chartSettings.color, rndColorIndex );

		return material;
	},
	byHeight: function( chartSettings, yHeight ) {
		var y = yHeight || 6;
		var x = chartSettings.math.xIterator;
		var z = chartSettings.math.zIterator;
			
		var material;
		
		for ( j = 0; j < chartSettings.color.heightZones.count; j++ ) {
				
			if ( y >= chartSettings.color.heightZones.zone[j].min && y <= chartSettings.color.heightZones.zone[j].max )  { 
				material = entities.materials.fromColor( chartSettings.color, j );
				debug.master && debug.lucidChart && console.log ('Chart Element ( x ', x, ', z', z, ') y = ', yHeight ,' . In zone ', j , '(min: ', chartSettings.color.heightZones.zone[j].min,', max: ', chartSettings.color.heightZones.zone[j].max,'). Assigned Material = ', material );
				break;
				}
			else debug.master && debug.lucidChart && console.log ('Chart Element ( x ', x, ', z', z, ') y = ', yHeight ,' . Not in zone ', j , '(min: ', chartSettings.color.heightZones.zone[j].min,', max: ', chartSettings.color.heightZones.zone[j].max,'). Trying next zone' );
			
			}
		
		// If no color is assigned, assign the highest zone color if y > maxThresh or the lowest zone color if y < minThresh
		!(material) ? material = lucidChart.color.minMaxThresh.colorOutside( chartSettings, y ) : material = material; 
		
		return material; 		
	},
	monoChrome: function() {
		var material = entities.materials.solid.phong.load ( chartSettings.color.monoColor.r , chartSettings.color.monoColor.g , chartSettings.color.monoColor.b );	
		return material;		
	}
};

/****** END LUCID CHART ENTITY CREATE ******/


/****** DYNAMIC COLOR LIBRARY GENERATION & PRELOAD ******/

entities.colorLib = {
	
	generate: function( chartSettings ) {
	
		var colorCount = chartSettings.color.count;
		var colorStops = chartSettings.color[chartSettings.color.gradientType + 'Stops'];
		var stopsCount = entities.colorLib.stops.get.count( colorStops );   // # color stops.	If stops = "red, orange, yellow, green", then 4.
		var octaveCount = stopsCount -1;										  // # color stops, minus the last. If 4 stops, then 3.
		var colorsPerOctave = Math.floor( colorCount / octaveCount )			  // # colors in each octave. If 14 colors and 3 octaves, then 4 (14/3 = 4.67) -> Math.floor(4.67) = 4
		var modulo = colorCount % octaveCount;									  // # left over after all octaves have been subtracted. If 14 colors and 3 octaves then 2 ( 14 = 12-2 -> 12/3...)
		var colorCountTruncated = colorCount - modulo;							  // # colorCount - modulo. If 14 colors total - 2, then 12.
		var colorCountAfterEachStop;											  // 
		var colors = {};
		
		chartSettings.color.palette.activeColorStops = colorStops;
		
		if ( chartSettings.color.gradientType === 'twoTone' || chartSettings.color.gradientType === 'grayScale') {
			colorCountAfterEachStop = colorCount - 1 ;	
		} 
		
		if ( chartSettings.color.gradientType === 'rainbow') {
			colorCountAfterEachStop = colorsPerOctave - 1 || 1 ;  // May need to fix this default later.
		}
			
		chartSettings.color.palette.stopsCount = stopsCount;
		chartSettings.color.palette.colorCountAfterEachStop = colorCountAfterEachStop;
		chartSettings.color.palette.octaveCount = octaveCount;
		chartSettings.color.palette.colorsPerOctave = colorsPerOctave;
		chartSettings.color.palette.modulo = modulo;
		
		chartSettings.color.palette.colorArray = entities.colorLib.asArray.populate( chartSettings );
		
		debug.master && debug.colorLib && console.log ('entities.colorLib.generate(): ',  chartSettings.color );
	},
	stops: {
		preset: {
			rainbow: function(){

				var rainbowStops = {
					red: 		{	r: 255,		g: 0, 		b: 0 	},
					orange: 	{	r: 255, 	g: 128, 	b: 0 	},
					yellow: 	{	r: 255,		g: 255,		b: 0 	},
					yellowGreen:{	r: 128,		g: 255,		b: 0 	},
					green:		{	r: 0,		g: 255,		b: 0 	},
					greenBlue:	{	r: 0,		g: 255,		b: 128 	},
					cyan:		{	r: 0,		g: 255,		b: 255	},
					blueGreen:	{	r: 0,		g: 128,		b: 255	},
					blue:		{	r: 0,		g: 0,		b: 255	},
					indigo:		{	r: 128,		g: 0,		b: 255	},
					purple:		{	r: 255,		g: 0,		b: 255	},
					violet:		{	r: 255,		g: 0,		b: 128	}
				};
	
				return rainbowStops;				
			},
			grayScale: function() {
				
				var grayScale = {
					black: 		{	r: 0,		g: 0,		b: 0 	},
					white:		{	r: 255,		g: 255,		b: 255	}
				}
				
				return grayScale;
			},
			twoTone: function() {
				
				var twoToneStops = {
					bottom: 	{	r: 0,		g: 128,		b: 255 	},
					top: 		{	r: 255,		g: 255,		b: 128	} 
				};
				
				return twoToneStops;
				
			}
		},
		get: {
			count: function( obj ) {
				var size = 0, key;
					for ( key in obj ) {
						if (obj.hasOwnProperty(key)) size++;
					}
				return size;		
			},
			first: function( stopSetObj ){
				
				var firstStop = stopSetObj[Object.keys(stopSetObj)[0]]; 
				
				debug.master && debug.colorLib && console.log( 'lucidChart.color.stops.get.first(): ', firstStop );
				
				return firstStop;
				
			},
			last: function( stopSetObj ){
				
				var lastStop = stopSetObj[Object.keys(stopSetObj)[Object.keys(stopSetObj).length - 1]];
				
				debug.master && debug.colorLib && console.log( 'lucidChart.color.stops.get.last(): ', lastStop );
				
				return lastStop;
				
			},
			deltas: function( obj, i ) {
				obj[i].delta = {};
				
				// Calculate the difference values;
				obj[i].delta.r = obj[i].r[0] - obj[i-1].r[0];
				obj[i].delta.g = obj[i].g[0] - obj[i-1].g[0];
				obj[i].delta.b = obj[i].b[0] - obj[i-1].b[0];
			},	
		},
		colorsBetweenEach: {
			get: {
				count: function( obj, colorCountAfterEachStop, i ) {
					
					debug.master && debug.colorLib && console.log ( 'entities.colorLib.stops.colorsBetweenEach.get.count: Object Imported: ', obj );
	
					obj[i].interval = {};
					
					// Calculated the color step size between two stops
					obj[i].interval.r = obj[i].delta.r / colorCountAfterEachStop;
					obj[i].interval.g = obj[i].delta.g / colorCountAfterEachStop;
					obj[i].interval.b = obj[i].delta.b / colorCountAfterEachStop;

					debug.master && debug.colorLib && console.log ( 'entities.colorLib.stops.colorsBetweenEach.get.count: Object Transformed: ', obj );
				}
			},
			calc: function( obj, colorCountAfterEachStop, i ) {					
				let h = i-1;
				
				debug.master && debug.colorLib && console.log ( 'entities.colorLib.stops.colorsBetweenEach.calc: Array imported: ', obj );
				
				for ( c = 1 ; c < /* colorCountAfterEachStop */ chartSettings.color.palette.colorsPerOctave ; c++ ) {			

					obj[h].r[c] = parseInt(Math.round( obj[h].r[c-1] + obj[i].interval.r ));
					obj[h].g[c] = parseInt(Math.round( obj[h].g[c-1] + obj[i].interval.g ));
					obj[h].b[c] = parseInt(Math.round( obj[h].b[c-1] + obj[i].interval.b ));
					
					// Make sure generated colors are within the 0-255 range.
					obj[h].r[c] >= 255 ? obj[h].r[c] = 255 : false;
					obj[h].g[c] >= 255 ? obj[h].g[c] = 255 : false;
					obj[h].b[c] >= 255 ? obj[h].b[c] = 255 : false;		

					obj[h].r[c] < 0 ? obj[h].r[c] = 0 : false;
					obj[h].g[c] < 0 ? obj[h].g[c] = 0 : false;
					obj[h].b[c] < 0 ? obj[h].b[c] = 0 : false;
					
				}
				
				debug.master && debug.colorLib && console.log ( 'entities.colorLib.stops.colorsBetweenEach.calc: Array Transformed: ', obj );
			}
		}
	},
	asArray: {
		populate: function( obj ) {

			var stopsArray = [];
			let i = 0;
			var key;

			for ( key in obj.color.palette.activeColorStops ) {
				
				if (obj.color.palette.activeColorStops.hasOwnProperty(key)) {
					
					stopsArray[i] = {};
					stopsArray[i].r = [];
					stopsArray[i].g = [];
					stopsArray[i].b = [];
				
					stopsArray[i].r[0] = obj.color.palette.activeColorStops[key].r;
					stopsArray[i].g[0] = obj.color.palette.activeColorStops[key].g;
					stopsArray[i].b[0] = obj.color.palette.activeColorStops[key].b;
					
					// Make sure none of the color values are over 255.
					
					stopsArray[i].r[0] >= 255 ? stopsArray[i].r[0] = 255 : false;
					stopsArray[i].g[0] >= 255 ? stopsArray[i].g[0] = 255 : false;
					stopsArray[i].b[0] >= 255 ? stopsArray[i].b[0] = 255 : false;
					
					if (i > 0) {
						entities.colorLib.stops.get.deltas( stopsArray, i );  // Color changes from one stop to the next.
						entities.colorLib.stops.colorsBetweenEach.get.count( stopsArray, obj.color.palette.colorCountAfterEachStop, i );
						entities.colorLib.stops.colorsBetweenEach.calc( stopsArray , obj.color.palette.colorCountAfterEachStop, i );
					}
					
					i++;
				}
			}
			
			var flattenedArray = entities.colorLib.asArray.flatten( stopsArray, obj.color.palette.colorCountAfterEachStop );
			
			debug.master && debug.colorLib && console.log ( 'entities.colorLib.asArray.populate(): ', flattenedArray );
			
			return flattenedArray;
		},
		flatten: function( obj, colorCountAfterEachStop ) {

			var stopsCount = obj.length;
			var asArrayLength = ((( stopsCount - 1 ) * colorCountAfterEachStop ) + 1); 
			var flatArray = [];
			var counter = 0;
			
			for ( a = 0; a < stopsCount; a++ ) {
				
				for (b = 0; b < obj[a].r.length ; b++ ){
					
					flatArray[counter] = {};
					
					flatArray[counter].r = obj[a].r[b];
					flatArray[counter].g = obj[a].g[b];
					flatArray[counter].b = obj[a].b[b];
					counter++
				};
				
			};

			debug.master && debug.colorLib && console.log ( 'entities.colorLib.asArray.flatten(): ', flatArray );
			
			return flatArray;
		}
	}

	
};

/****** END DYNAMIC COLOR LIBRARY GENERATION & PRELOAD ******/

/****** UTILITIES FOR GENERAL EVENT HANDLING ******/

function dispatchLoggedEvent( e ) {

	debug.master && debug.events && console.log ( 'About to dispatch ' , e );
	dispatchEvent( e );
	debug.master && debug.events && console.log ( 'Just dispatched ' , e );
		
}

/****** END UTILITIES FOR GENERAL EVENT HANDLING ******/

/****** UTILITIES FOR TRANSFORMING OBJECTS LOADED INTO THE SCENE FROM EXTERNAL SOURCES ******/

function makeLoadedGeometryLineDrawing() {
	
	var mesh = entities.geometries.dynamic.loadedFromExternal.bufferGeoms.passedMesh;
	
	function positionObject( mesh ) {
		mesh.position.y = 15;
	}
	
	entities.geometries.dynamic.loadedFromExternal.mutated.meshAsLineDrawing = new THREE.Line ( geo2line( mesh.geometry ), entities.materials.line.dashed.red, THREE.linePieces );
	
	scene.add( entities.geometries.dynamic.loadedFromExternal.mutated.meshAsLineDrawing );	
	
	positionObject( entities.geometries.dynamic.loadedFromExternal.mutated.meshAsLineDrawing );
}

/* PARKED FUNCTIONS */

/*
function userEquation( usrEquation ) {
		
	var functionBody = usrEquation;
	var prefix = 'function( x, z ) { return (';
	var suffix = ') ; }';
	
	var entire = prefix + functionBody + suffix;
		
	return entire;
} */

/****** UTILITY (EXPERIMENT FOR PARSING MATH INPUT FROM USER )******/

/*

function parseExponentialExpression ( expression ) {
	
	var powerSign = '^';
	var length = expression.length;
	var parsedExpression;
	
	operand = expression.substring( expression.indexOf(0) , expression.indexOf( powerSign ) );
	exponent = expression.substring( ( expression.indexOf( powerSign ) + 1 ) );
	
	parsedExpression = 'Math.pow(' + operand + ', ' + exponent + ')';
	evaluatedExpression = eval( parsedExpression );
	
	debug.master && debug.math && console.log( 'Parsed Exponential Expression = ', parsedExpression );
	debug.master && debug.math && console.log( 'Parsed Exponential Expression evaluates to :' , evaluatedExpression );
}

*/

/*

function geo2line( geo ) {

    var geometry = new THREE.Geometry();
    var vertices = geometry.vertices;

    for ( i = 0; i < geo.faces.length; i++ ) {

        var face = geo.faces[ i ];

        if ( face instanceof THREE.Face3 ) {

                vertices.push( geo.vertices[ face.a ].clone() );
                vertices.push( geo.vertices[ face.b ].clone() );
                vertices.push( geo.vertices[ face.b ].clone() );
                vertices.push( geo.vertices[ face.c ].clone() );
                vertices.push( geo.vertices[ face.c ].clone() );
                vertices.push( geo.vertices[ face.a ].clone() );

        } else if ( face instanceof THREE.Face4 ) {

                vertices.push( geo.vertices[ face.a ].clone() );
                vertices.push( geo.vertices[ face.b ].clone() );
                vertices.push( geo.vertices[ face.b ].clone() );
                vertices.push( geo.vertices[ face.c ].clone() );
                vertices.push( geo.vertices[ face.c ].clone() );
                vertices.push( geo.vertices[ face.d ].clone() );
                vertices.push( geo.vertices[ face.d ].clone() );
                vertices.push( geo.vertices[ face.a ].clone() );

        }

    }

    geometry.computeLineDistances();

    return geometry;
}

*/

/* END PARKED FUNCTIONS */



})();