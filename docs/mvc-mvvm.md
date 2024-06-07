

# MVVM 和MVC区别

## 定义

#### MVC：
<p>Model 负责存储页面的业务数据，以及对相应数据的操作。并且 View 和 Model 应用了观察者模式，当 Model 层发生改变的时候它会通知有关 View 层更新页面。</p>
<p>其中 View 负责页面的显示逻辑，描述的是Model的当前状态。Observe模式用于让View了解Model什么时候 更新或修改。</p>
<p>Controller 层是 View 层和 Model 层的纽带，它主要负责用户与应用的响应操作，当用户与页面产生交互的时候，Controller 中的事件触发器就开始工作了，通过调用 Model 层，来完成对 Model 的修改，然后 Model 层再去通知 View。</p>

#### MVVM：
<p>Model：代表数据模型，数据和业务逻辑都在Model层中定； 指的是js中的数据，如对象，数组等等.</p>
<p>View：代表UI视图，负责数据的展示； 页面视图.</p>
<p>ViewModel：Model和View并无直接关联，而是通过ViewModel来进行联系的，Model和ViewModel之间有着双向数据绑定的联系。因此当Model中的数据改变时会触发View层的刷新，View中由于用户交互操作而改变的数据也会在Model中同步。 </p>
<p>这种模式实现了 Model和View的数据自动同步，因此开发者只需要专注于数据的维护操作即可，而不需要自己操作DOM。</p>

## 区别

1. MVVM 实现了数据与页面的双向绑定，MVC 只实现了 Model 和 View 的单向绑定。
2. MVVM是真正将页面与数据逻辑分离放到js里去实现，而MVC面未分离。
3. MVVM 实现了页面业务逻辑和渲染之间的解耦，也实现了数据与视图的解耦，并且可以组件化开发。
 
-  Vue是不是MVVM框架？
<p> Vue是MVVM框架，但是不是严格符合MVVM，因为MVVM规定Model和View不能直接通信，而Vue的ref可以做到这点</p>
- VUE是如何体现MVVM思想的？ 
<p> v-on 事件绑定，通过事件操作数据时，v-model 会发生相应的变化。</p>