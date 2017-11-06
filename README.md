# LucidChart
LucidChart, currently in alpha-stage, is an application (and potentially library) I'm continuing to develop using Javascript and THREE.js, for desktop, mobile, and soon mixed-reality. Initially conceived as a means to teach myself these tools, the project has gained a life of it's own as a means to turn math and data into something expressive, immersive, informative and beautiful.

The app is running live at http://experiments.vertecology.com/lucidchart/

js directory includes THREE.js files essential to app function.
___________________________________________________________________________

# Changelog

Changes - Version 0.1
- encapsulates all scene elements in an object called "SceneElements"
- successfully passes the geometry from a loaded OBJ file into a manipulable geometry
  whose vertices are accessible.

Changes - Version 0.1.1
- Working out camera controls using this tutorial:
- https://www.sitepoint.com/bringing-vr-to-web-google-cardboard-three-js/
- Successful integration of THREE.js Orbitcontrols
- No-pan & No-zoom set to 'true' for now.

Changes - Version 0.1.2
- Added Colored Axes delineating the Origin point to help orient.

Changes - Version 0.1.3
- General Code cleanup

Changes - Version 0.1.4
- Add GridBoxes

Version 0.1.5 
- Organize Code for Human Readability
- Parameterize the GridBoxes to allow for different behaviors:
    - Random
	- Test
    - Math Functions

Version 0.1.6
- Further code organizing re patterns
- Generalization of Phong Material generation
- Added gridBox xRangeStart and zRangeStart optional parameters, default 0. These allow the user to specify a range-start other than the origin point on the xz plane.
- Consolidated gridBox args into three parameters, each of which is an object holding many properties.

Version 0.1.7
- Change the minPlusSquare function to minPlusExponent and make the power-of value a dynamic variable 
- Bug Fix: Change the operation in the minPlusExponent function from base^exponent to Math.pow(base,exponent) for correct math rendering.
- Add xIterator and zIterator useMath object properties to allow for dynamic iteration through values while looping.
- Add quadraticEquation as a new heightFunction option to gridBoxes
- Get userInputMath able to parse and pass a three-variable mathematical function 
- Add materialSides colorScheme object property to prevent entities appearing inside-out, especially with regard to negative dimensions
- Add the colorByHeight function as a second colorScheme option.

Version 0.1.8
- Add Colorization handling for above maxima and minima via the assignOutOfRangeColor function; enable manual or automated settings of maxima and minima
- Add prettyDemoQuadraticEquations function to organize and render some pretty demo function presets.
- Add useMath.renderCapAsApproachesInfinity boolean and useMath.renderHeightCap to cap rendering of equations whose values approach infinity. 
- Rename GridBoxes to multiDimensionalBarChart

Version 0.1.9
- Add prototype UI
- Integrate Bootstrap for better UI rendering
- Set chartSettings as a globally available object & clean up initGeometries.

Version 0.2.0
- Add additional UI elements, test initial display of var contents in inputs

Version 0.2.1
- Refactoring of multiDimensionalBarChart function and related utility functions:
	- replace demo function numerical array with object with string-keys and anonymous functions as values. Additionally move the function invocation from for-loop
	  to top of function body so only the relevant function is called, and only needs to be called once. This accelerated performance significantly. 
	  
Version 0.2.2
- Resolved issue where renderer.domElement was a child of <body>, making UI impossible. Now both desktopUI and the canvas element (assigned ID and Class via setAttribute)
  are now children of the #container element. This allows user manipulation of UI elements.
- Added working 'Update' button to the DesktopUI - Tested, successfully operating.
- Added ParentObj function and now add chart components as children of a parent object. This hierarchical setup now allows deletion and re-rendering of the chart, and 
  will in the future enable operations on the chart such as move as a unit, multiple charts, and use of local object-level coordinates. 
  
Version 0.2.3
- Function body now renders successfully in UI 'Equation' field, though still requires Javascript mathematical notation to work.
- Separated 'updateDesktopUI' statements into two functions to successfully manage the dynamic or non-dynamic updatability of form-type elements.
- Fixed bug where the 'basicQuadratic' function choice works correctly but does not parse correctly in the DesktopUI Equation textarea.
- Setup beggining handling of user-input equations. setChartEquation function (not rendering properly, doesn't update DesktopUI Equation textarea after change.)

Version 0.2.4
- Attempted to handle what happens when the user inputs a custom equation. Broke the app! Reverting to version 0.2.3 and calling it 0.2.5.

Version 0.2.5
- Refactoring of updateChartSettings() to include dynamic integration of user input & logic.

Version 0.2.6
- Fixed swappability between dataType 'randomHeight' and 'equation' via desktopUI

Version 0.2.7
- Got swappability between colorMode 'randomColor' and 'colorByHeight' working
- Added transparent ground plane, initalized via initStaticGeometries();
- split initGeometries() into initStaticGeometries() and initDynamicGeometries();
- Added Monotone coloration option

Version 0.2.8
- Crash recovery. Rebuilt interface

Version 0.3.0 ~ 0.3.4
- Successfully refactored color/material handling and wired monoChrome color selector on desktop UI to the model. 
- Now using ColorLib() function to manage the generation of color gradients (top and bottom colors).

Version 0.3.5
- Successfully pegged top & bottom colors to interface and rendered object to allow for user-generated gradients.

Version 0.3.6
- Renamed minHeight & maxHeight to minUserSetHeight & maxUserSetHeight
- Pegged maximum and minimum color range to actual function values.
- Renamed yMinColorize and yMax~ to minColorHeight and max~ for consistency across the application.
- Changed default values in updateChart from this.~ to identities to prevent unexpected returns as 'undefined'.
- Got minColorHeight & max~ partially working (issue that radio cannot be unchecked.)

Version 0.3.7
- Refactoring updateDesktopUIStaticElements & updateDesktopUIDynamicElements into separate functions to address each form element type in consideration of functionality issues:
	- Updating 'equation' select reverts colorpickers to colors assigned prior to user change. 

Version 0.3.7.1
- Tested new updateDesktopUI~ functions worked, removed old.

Version 0.3.8
- Created second 'for' loop in lucidChart() so to be able to pass a static generatedHeight to the useColorFunction before generating the actual chart object.

Version 0.3.9
- Refactored useColorHeight functions, first param is now the 'colorScheme' object. This standardizes and simplifies invocations and gives the color functions access to all relevant
  values
- Reconstructed assignOutOfRangeColor() function to fix bugs where no color material was being generated, and to support user-option of whether to intentionally manually set   	  
  colorization-height thresholds and manually assign colors to above and below thresholds. 

Version 0.3.10
- Changed hasMinMaxColorThreshold UI element from radio to check to prevent need for custom handling on uncheck.
- Renamed radioButtonSelectedValueSet() to radioOrCheckSelectedValueSet();
- Renamed updateDesktopUIRadioElements() to updateDesktopUIRadioAndCheckElements();

Version 0.3.11
- Refactored Chart object names.
- Successfully coupled colorAboveThreshold and colorBelowThreshold to TopColor and BottomColor.
- Set up conditional with confirm dialog that allows the user to proceed and change the colorAboveThreshold or colorBelowThreshold manually or turn back and preserve coupling. 
- Added 'coupled' var to the color coupling handling to support the user having to make the choice only once to uncouple.

Version 0.3.11.1
- Renamed 'coupled' as in 'coupledColor' to 'bound' as in 'boundColor' as relates to binding of colorBelowThreshold/colorAboveThreshold to topColor/bottomColor.
- created UI.states object to handle, manage and remember user-set UI states (such as binding of colorBelowThreshold/colorAboveThreshold to topColor/bottomColor) and replaced the
  'bound' var with UI.states.thresholdColorsBound boolean. 

Version 0.3.12
- Built ColorLib2 and related functions to support color gradients with more than two stops.
- Changed topColor and bottomColor properties of both UI.desktop and chartSettings.colorScheme to colors.top and colors.bottom to make them passable as a single object to the colorLib2 function.

Version 0.3.13
- Refactored the colorLib2 function as ColorLibGenerate, and did so such that the calculationns run in generating the library of colors from which to generated
  materials only needs to get done once, instead of with the creation of each rendered chart subcomponent. The dynamic parameters used to generate the color library
  and the RGB values of the color library itself are now stored in the chartSettings.colorScheme.colorLibGen object. They're initialized with initChart when the
  app loads, and updated with updateChart(), which gets invoked on the user clicking the Update button. Performance does seem to be notably faster.
- Rearranged Code into more logical categories.
- Renamed assignOutOfRangeColor() to outOfRangeColors();
- Fixed bug where choosing an eqation no longer updated the Random/Equation select button.
- Added UI functionality to Gradient Type option. user action now changes chartSettings.colorScheme.gradientType, but no behavior is associated to that value yet.

Version 0.3.14
- Refactored useColorFunction option functions and related utility functions to receive chartSettings object instead of its individual sub-objects. This should
  allow for more streamlined handling and access to all object components. Easier to reason about.
  
Version 0.3.15
- Got Spectral rendering working. Still a couple of bugs regarding colorMode:
	1: Number of colors generate is actually one greater than what the user enters.
	2: Top and bottom colors are reversed when rendering Two-Tones.
	3: ColorAbove and ColorBelow are not yet set to top and bottom stops in spectral rendering.

Version 0.3.16
- Added a debug mode and made all console calls dependent on the mode being turned on (debug = true). Noted significant performance increase.

Version 0.3.17
- Successfully getting camera position to update from the UI. Bug noted:
	1: Input box stops being dynamically updated after user inputs, though the position actually does change. 
	
Version 0.4
- Beginning the final refactoring and removal of excess features for the current version.
- Added debug feature to lucidChart that prints generatedHeight min and max to the console.
- Fixed bug where the generatedHeight.min would return as zero if the lowest point on the chart was above 0, and the generatedHeight.max would return as zero if the highest point
  was below 0.  
- Added logic to determine if lucidChart yHeight is not returning as NaN (not returning as an imaginary number) before generating the chart element. This seems to have accelerated
  performance.
- Refactored handleRenderCap() to handle the if-logic originally in the lucidChart constructor. 
- Bug Fixed: "When the colorByHeight function is selected and the min value > 0, an error gets thrown. 'Material' comes back as undefined." This was fixed with the generatedHeight
  fix.
  
Version 0.4.1
- Upgraded instrumentation in colorByHeight function to reveal the yHeight, active element x & z positions and current zone minima and maxima. This significantly improves insight
  into the operations of the function. Still to be done - further refactor instrumentation in this function and add it to the lucidChart function as well as other color function
  options.
  
Version 0.4.2
- As part of instrumentation refactor of colorByHeight function, refatored the function itself. Now the color zones are figured in their own function (and calculated only once). The
  new clearColorZones() and setColorZones() are now invoked in the lucidChart function (may later migrate these from here to work in accordance with existing initChart and updateChart patterns). These functions add attional properties directly to the chartSettings object, which will make instrumentation easier and make the color zones useable for 
  additional purposes. This also significantly simplified the colorByHeight function and improved performance somewhat. 
  
Version 0.4.3
- Added the color zones properties to the initChart function so that they're included from the beginning. Initial settings null.
- Added the 'hasColorZones' boolean property to chartSettings.color. Initialized value = false. updateColorMode() function now changes this value based on what color function is
  being used. If the selected mode requires zones, the value is set to true. In the lucidChart function, the color zones properties are now cleared, then the function checks the
  'hasColorZones' property is false, nothing happens; if it is true, setColorZones() is invoked. This should increase performance as zones are now calculated only once, and only
  when needed.
- Bug fixed (identified v0.4.1): 
	- Certain rangeStart.x or rangeStart.z value combinations were causing:
		- setColorZones() variables minColorHeight &/or maxColorHeight to be undefined
		- totalColorizeRange to be undefined
		- color zone min/max to be NaN
		- therefore 'material' to return as undefined when no manual Height range was specified (using generatedHeight):
		
			- WHEN			prettyQuadratic 7 	&& 	colorByHeight	&& Two-Tone		x=0, z=0, y=NaN
			- NOT WHEN		prettyQuadratic 7	&&	colorByHeight	&& Two-Tone		x=0, z=0, y=NaN
			- WHEN			prettyQuadratic 7	&&  colorByHeight	&& Two-Tone		x=0, z=20, y=0.05
			- NOT WHEN		prettyQuadratic 7 	&&	colorByHeight	&& Two-Tone		x=0, z=-20
			- NOT WHEN		prettyQuadratic 7 	&&	colorByHeight	&& Two-Tone		x=20, z=-20
			- NOT WHEN		prettyQuadratic 7 	&&	colorByHeight	&& Two-Tone		x=-20, z=20
			- NOT WHEN		prettyQuadratic 7 	&&	colorByHeight	&& Two-Tone		x=-20, z=0	
			- NOT WHEN		prettyQuadratic 7 	&&	colorByHeight	&& Two-Tone		x=20, z=0	
			- WHEN			prettyQuadratic 7 	&& 	colorByHeight 	&& Spectral		x=0, z=0, y=NaN
			- NOT WHEN  	randomHeight		&&	colorByHeight					x=0, z=0
			- NOT WHEN 		prettyQuadratic 0	&& 	randomColor						x=0, z=0, y=0
			- NOT WHEN		prettyQuadratic 0   && 	colorByHeight 	&& Two-Tone		x=0, z=0
			- NOT WHEN		prettyQuadratic 0	&&	colorByHeight 	&& Spectral		x=0, z=0
			- NOT WHEN		prettyQuadratic 1	&&	colorByHeight	&& Two-Tone		at x=0, z=0
			- NOT WHEN		prettyQuadratic 1	&& 	colorByHeight	&& Two-Tone		x=-20, z=-20
			- WHEN			prettyQuadratic 1 	&&	colorByHeight	&& Two-Tone		x=-20, z=20
			- WHEN			prettyQuadratic 1	&&	colorByHeight	&& Two-Tone		at x=0, z=20
			- NOT WHEN		prettyQuadratic 1	&&	colorByHeight	&& Spectral		at x=0, z=0
	The bug was fixed by adding '|| 0' to the lines defining minColorHeight & maxColorHeight in setColorZones;
- Bug fixed (identified v0.4.3) Material was returning undefined when:
			- NOT WHEN		prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=0, z=0
			- NOT WHEN		prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=0, z=20
			- WHEN			prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=0, z=-20  (Happens mid-render, zones appear to generate)
			- NOT WHEN		prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=20, z=0
			- NOT WHEN		prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=20, z=20
			- NOT WHEN		prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=20, z=-20
			- WHEN			prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=-20, z=20 (Happens mid-render, zones appear to generate)
			- WHEN			prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=-20, z=0  (Happens mid-render, zones appear to generate)
			- NOT WHEN		prettyQuadratic 0	&&	colorByHeight 	&& no manual color Height Range		&& x=-20, z=-20
	The bug was fixed by changing > and < comparisons between yHeight and min and max heights in the outOfRangeColors function to >= and <=. The issue appears to have been that
	in some cases the 8th-place decimal of yHeight was coming in just above or below the min or max height value 8th-place decimal value.

version 0.4.4
- Complete refactor of UI handling. All UI inputs, updates and events are initialized and handled within a tree structure within the UI() function.

Version 0.4.5
- Complete refactor of axes and cameras.
- Significant refactor of lucidChart and assignment of lucidChart functions to the lucidChart false namespace.

Version 0.4.6 & 0.4.7
-Further refactor of lucidChart

Version 0.4.8
- Fixed bug where top and bottom colors were rendering in reverse order on twoTone object renders.
- Further refactor of lucidChart:
	- Added 'lucidChart.type' property, and assigned 'bar()' as the first 'type.' This black-boxes bar-chart functionality already developed and establishes future potential for
	  additional data-representation types.
	- Added 'thickness' parameter to the lucidChart.type.bar(), allowing for future functionality where bar thickness can be <=> 1
	
Version 0.4.9
- Refactoring of scene.entities.materials.

Version 0.4.10
- Refactored loader utilities. (Actual loader functions may still not work, but noting huge skill-up since I wrote these in July. Contained any issues that may still be arising as these 
  utilities will be useful in the future. )

Version 0.4.11
- Modified the preset equation dictionary so that each preset now has a 'computed' and 'display' property. The computed is the actual function run by the machine, Display is what's shown in the
  interface. Display will eventually be genearted by a modification of the parse function. 

Version 0.4.12 & 0.4.13
- Refactoring of the DesktopUI. "xCount" & "yCount" are now calculated from range.end.x - range.start.x and range.end.y - range.start.xCount

Version 0.4.14
- Added show/hide logic to initial DesktopUI states.
- Further interface debug.
- Known remaining interface issues:
	- When dataType = "RandomHeight" and colorMode = "colorByHeight" sometimes the hasThresholds button still appears. 
	- Random Min/Max heights do not register in the equationTextbox dynamically until after update.
	- When color scheme threshold min/max is set to 0, it does not apply correctly.
	- Above & Below Thresh default colors should be equivalent to rainbow min/max when gradientType is Rainbow
	
Version 0.4.15
- Fixed bug: Random min/max height change now registers dynamically in equationTextbox

Version 0.4.16
- Fixe bug: When dataType = "RandomHeight" and colorMode = "colorByHeight" sometimes the hasThresholds button still appears.

Version 0.4.17
- Fixed bug: When color scheme threshold min/max is set to 0, it does not apply correctly. Required refactoring of logic of algorithms that check for a min/max threshold.  

Version 0.5
- Changed Color Depth from number input to slider for cleaner UX
- Initial refactor of Colorlib functions - now integrated under scene.entities.colorLib object.
- Known issues: 
		- out of range color functionality still gets run every time a chart component is out of height color zone - this slows performance.
		- Out of range color logic
		
Version 0.5.0.1
- added functions to get the first and last stops in whatever set of color-stops gets used. 

Version 0.5.0.2
- Fixed bug: When bound to top & bottom (first and last) colors in the schee, above and below colors adapt to the scheme.
- Added 'GrayScale' gradientType.
- Adjusted lighting to pure white to allow for accurate color rendering.

Version 0.5.1
- Changed the Palette Depth input from a number input to a slider with three settings - significantly simplifying color handling.

Version 0.5.2
- Refactored calculation of integrally-generated color scheme min & max thresholds so that they're calcuated only once, rather than with every chart element that goes outside
  of height zones. Some increase in rendering performance noted. 
- Gave nicknames to the equations.
- Repositioned initial camera for prettier view.
	
Version 0.5.3
- Added Bar Thickness feature

Version 0.5.4
- Refactoring: 
	- Uncoupled 'entities' & 'utils' objects from 'scene' (THREE.scene object) to avoid potential confusion with native THREE.js functionality.
	- Renamed 'desktopUI' to 'browserUI' to prevent potential conflicts with native brower functionality and potential confusion between desktop & mobile functionailty (both operate with the same UI/controls).
	- Renamed 'UI.VR' to 'UI.mixedReality' in consideration of full range of potential uses.
- Debugging - set up local debug flags to allow for debugging of code sections independently (and caught a couple of minor instrumentation issues in the process)

Version 0.5.5
- Ran through code analyzer (JSHint). Fixed a number of syntax warnings and removed unused variables.

Version 0.5.6
- Remove unused code (functions retrievable in Version 0.5.5 - run diff)
- Additional code cleanup & simplification. Uncoupled colorLib object from entities object.
