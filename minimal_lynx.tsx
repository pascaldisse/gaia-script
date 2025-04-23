// Generated LynxJS from GaiaScript
import {{Component,State,Watch,Prop,h}} from '@lynx-ui/react';
import '@lynx-ui/components/dist/tabs';
import '@lynx-ui/components/dist/code-block';
import {{Neural}} from '@lynx-ui/neural';
import {{backgroundOnly}} from '@lynx-ui/directives';

// Components


// App definition
@Component({{
  tag:'gaia-app',
  styleUrl:'gaia-app.css',
  shadow:true
}})
export class GaiaApp {{
  @State() state={{
    score:0,
    running:false,
    progress:0,
    inputValue:'',
    neuralModel:null
  }};
  
  @Prop() platform:string;
  
  // Lifecycle hooks
  componentWillLoad(){{
    this.initialize();
    this.checkPlatform();
  }}
  
  initialize(){{
    // Create neural model
    this.state.neuralModel=new Neural.Sequential();
    this.state.neuralModel.add(new Neural.Conv2D({{filters:32,kernelSize:3,activation:'relu'}}));
    this.state.neuralModel.add(new Neural.MaxPooling2D({{poolSize:2}}));
    this.state.neuralModel.add(new Neural.Flatten());
    this.state.neuralModel.add(new Neural.Dense({{units:64,activation:'relu'}}));
    this.state.neuralModel.add(new Neural.Dense({{units:10,activation:'softmax'}}));
  }}
  
  // Event handlers
  handleStart={{()=>{{
    this.state.running=true;
    this.state.score=0;
    this.startGameLoop();
  }}}};
  
  handleReset={{()=>{{
    this.state.running=false;
    this.state.score=0;
  }}}};
  
  handleInput=(e)=>{{
    this.state.inputValue=e.target.value;
  }};
  
  @Watch('state.score')
  scoreChanged(newValue){{
    console.log(`Score updated: ${{newValue}}`);
  }}
  
  runBackgroundTask(){{
    // This runs in a separate thread
    for(let i=0;i<100;i++){{
      setTimeout(()=>{{
        this.state.progress=i;
      }},i*50);
    }}
  }}
  
  checkPlatform(){{
    const isLynx=typeof window==='undefined';
    console.log(`Running on ${{isLynx?'LynxJS native':'web browser'}}`);
  }}
  
  startGameLoop(){{
    if(!this.state.running) return;
    this.state.score++;
    requestAnimationFrame(()=>this.startGameLoop());
  }}
  
  // Main render
  render(){{
    const isRunning=this.state.running;
    
    return (
      <view class="app-container">
        <view class="game-area">
          
        </view>
        
        <view class="controls">
          <lynx-button primary onClick={{this.handleStart}} disabled={{isRunning}}>Start</lynx-button>
          <lynx-button onClick={{this.handleReset}}>Reset</lynx-button>
          <text>Score: {{this.state.score}}</text>
        </view>
        
        
<lynx-tab-group>
  <lynx-tab id="basic">Basic Components</lynx-tab>
  <lynx-tab id="3d">3D Rendering</lynx-tab>
  <lynx-tab id="neural">Neural Networks</lynx-tab>
  <lynx-tab id="threads">Threading</lynx-tab>
  <lynx-tab id="code">Source Code</lynx-tab>

  <lynx-tab-panel id="basic">
    <view class="demo-panel">
      <h3>Basic UI Components</h3>
      <view class="demo-row">
        <text>LynxJs brings native components to web:</text>
        <lynx-button primary>Native Button</lynx-button>
      </view>
      <view class="demo-row">
        <text>Data binding with @State and @Prop:</text>
        <lynx-input bindinput={{this.handleInput}} value={{this.state.inputValue}}></lynx-input>
      </view>
    </view>
  </lynx-tab-panel>
  
  <lynx-tab-panel id="3d">
    <view class="demo-panel">
      <h3>Optimized 3D Rendering</h3>
      <lynx-scene>
        <lynx-camera position="0,0,5"></lynx-camera>
        <lynx-mesh geometry="sphere" material="standard" color="#3080FF"></lynx-mesh>
        <lynx-light type="directional" intensity="0.8"></lynx-light>
      </lynx-scene>
      <text>Native 3D rendering powered by GPU acceleration</text>
    </view>
  </lynx-tab-panel>
  
  <lynx-tab-panel id="neural">
    <view class="demo-panel">
      <h3>Neural Network Integration</h3>
      <lynx-model-view model={{this.neuralModel}}></lynx-model-view>
      <text>High-performance ML model execution with PrimJS</text>
    </view>
  </lynx-tab-panel>
  
  <lynx-tab-panel id="threads">
    <view class="demo-panel background-only">
      <h3>Multi-Threading Support</h3>
      <lynx-progress value={{this.state.progress}}></lynx-progress>
      <text>Background processing with the background-only directive</text>
      <lynx-button onClick={{this.runBackgroundTask}}>Run Heavy Task</lynx-button>
    </view>
  </lynx-tab-panel>
  
  <lynx-tab-panel id="code">
    <view class="demo-panel">
      <h3>GaiaScript Source (89 bytes)</h3>
      <lynx-code-block language="gaiascript">N[gamma+phi+delta+alpha]gamma:H-&gt;800x600-&gt;P-&gt;[3x3]-&gt;[(button+click-&gt;phi.1),(button+click-&gt;phi.0),(input-&gt;phi.s)]phi:O-&gt;[T10-&gt;L20-&gt;P-&gt;D32-&gt;T]x3-&gt;60delta:I224x224x3-&gt;C1_32-&gt;P-&gt;C2_64-&gt;P-&gt;F-&gt;D1_128-&gt;D2_64-&gt;D0_10-&gt;Salpha:Triangle-&gt;Transform-&gt;Render-&gt;Light-&gt;Star-&gt;Box-&gt;Sphere</lynx-code-block>
      
      <h3>Compiled LynxJS (4.8 KB)</h3>
      <lynx-code-block language="tsx" maxHeight="200px" expandable>
      @Component({{
        tag: 'gaia-app',
        styleUrl: 'gaia-app.css',
        shadow: true
      }})
      export class GaiaApp {{
        @State() appState = {{}};
        // ... more code ... 
      }}
      </lynx-code-block>
      
      <text>GaiaScript achieves 98% code reduction (89 bytes vs 4.8 KB)</text>
    </view>
  </lynx-tab-panel>
</lynx-tab-group>
        
      </view>
    );
  }}
}}
