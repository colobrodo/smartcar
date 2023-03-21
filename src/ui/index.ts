import PanelManager from "./panel-manager";
import SimulationPanel from "./panels/simulation";
import Editor, { EntityType, EditorMode } from "./panels/editor";
import { Tab, TabGroup } from "./tabs";
import PopulationTooltip from "./population-tooltip";

import type Circuit from "../circuit";


export let panels = new PanelManager(),
   editor: Editor,
   simulation: SimulationPanel,
   tabs: TabGroup,
   tooltip: PopulationTooltip;

function createPanelTab(panels: PanelManager, name: string): Tab {
   return {
      name,
      open() {
         panels.run(name);
      }
   }
}

export function initialize(circuit: Circuit) {
   const tooltipContainer = document.getElementById('tooltip');
   tooltip = new PopulationTooltip(tooltipContainer);

   editor = new Editor(circuit);
   simulation = new SimulationPanel(circuit);
   panels.add('editor', editor);
   panels.add('simulation', simulation);

   const simulationBar = document.getElementById('simulation-bar');
   const editorBar = document.getElementById('editor-bar');
   const editorBtn = document.getElementById('editor-btn');
   const simulationBtn = document.getElementById('simulation-btn');

   const pauseBtn = document.getElementById('simulation-pause');
   
   const toggle = _ => simulation.paused = !simulation.paused; 
   simulation.addShortcut(' ', toggle);
   pauseBtn.onclick = toggle;
   
   tabs = new TabGroup();

   tabs.attach(editorBtn, createPanelTab(panels, 'editor'));
   tabs.bind('editor', editorBar);

   const editorModeTabs = new TabGroup();
   editorModeTabs.attach(document.getElementById('editor-draw'), {
      name: 'draw',
      open() {
         editor.setMode(EditorMode.DRAW);
      }
   });
   editorModeTabs.attach(document.getElementById('editor-cancel'), {
      name: 'cancel',
      open() {
         editor.setMode(EditorMode.CANCEL);
      }
   });
   const subjectBar = document.getElementById('draw-subject');
   editorModeTabs.bind('draw', subjectBar);
   editorModeTabs.open('draw');

   const editorDrawSubject = new TabGroup();
   editorDrawSubject.attach(document.getElementById('draw-wall'), {
      name: 'wall',
      open() {
         editor.setDrawSubject(EntityType.WALL);
      }
   });
   editorDrawSubject.attach(document.getElementById('draw-checkpoint'), {
      name: 'checkpoint',
      open() {
         editor.setDrawSubject(EntityType.CHECKPOINT);
      }
   });
   editorDrawSubject.attach(document.getElementById('draw-goal'), {
      name: 'goal',
      open() {
         editor.setDrawSubject(EntityType.GOAL);
      }
   });
   editorDrawSubject.open('wall');

   // editor shortcuts
   editor.addShortcut('d', _ => editorModeTabs.open('draw'));
   editor.addShortcut('c', _ => editorModeTabs.open('cancel'));
   editor.addShortcut('1', _ => editorDrawSubject.open('wall'));
   editor.addShortcut('2', _ => editorDrawSubject.open('checkpoint'));
   editor.addShortcut('3', _ => editorDrawSubject.open('goal'));

   tabs.attach(simulationBtn, createPanelTab(panels, 'simulation'));
   tabs.bind('simulation', simulationBar);

   tabs.open('simulation');
}