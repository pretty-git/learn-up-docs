# Vue的生命周期

“Vue实例有一个完整的生命周期，也就是从开始创建、初始化数据、编译模板、挂载Dom、渲染→更新→渲染、卸载等一系列过程，我们称这是Vue的生命周期。通俗说就是Vue实例从创建到销毁的过程，就是生命周期。”

### 异步请求在哪一步发起？

如果异步请求不需要依赖 Dom 推荐在 created 钩子函数中调用异步请求，因为在 created 钩子函数中调用异步请求能更快获取到服务端数据，减少页面 loading 时间；
ssr 不支持 beforeMount 、mounted 钩子函数，所以放在 created 中有助于一致性性。
可以在钩子函数 created、beforeMount、mounted 中进行异步请求，因为在这三个钩子函数中，data 已经创建，可以将服务端端返回的数据进行赋值。

1. beforeCreate（创建前）：数据观测和初始化事件还未开始，此时 data 的响应式追踪、event/watcher 都还没有被设置，也就是说不能访问到data、computed、watch、methods上的方法和数据。
这个初始化阶段：初始化provide、inject和实例上配置的 options 包括 props、methods 、data、computed、watch、，初始化一些属性、事件、以及响应式数据。
2. created（创建后）： created 实例已经创建完成之后被调用。在这一步，实例已完成以下的配置：数据观测(data observer)，属性和方法的运算watch/event 事件回调。这里没有el 如果非要相与Dom进行交互, 可以通过vm.nextTick来访问Dom。
模板编译阶段：主要是将模板编译为渲染函数，
3. beforeMount（挂载前）：在挂载开始之前被调用，相关的render函数首次被调用。生成虚拟DOM，但是还没转成真实DOM还没有挂载html到页面上。
挂载阶段，vue.js会将其实例挂载到DOM元素上，就是将模板渲染到指定的DOM元素中，在这过程中，vue.js会开启watcher来持续追踪依赖的变化。
4. mounted（挂载后）：mounted 在挂载完成后发生，在当前阶段，真实的 Dom 挂载完毕，数据完成双向绑定，可以访问到 Dom 节点
5. beforeUpdate（更新前）：响应式数据更新时调用，新的虚拟DOM生成了，但是还没有和旧的虚拟DOM进行对比打补丁。
6. updated（更新后） ：在由于数据更改导致的虚拟DOM重新渲染和打补丁之后调用。此时 DOM 已经根据响应式数据的变化更新了。调用时，组件 DOM已经更新，所以可以执行依赖于DOM的操作。然而在大多数情况下，应该避免在此期间更改状态，因为这可能会导致更新无限循环。该钩子在服务器端渲染期间不被调用。
7. activated：被keep-alive缓存的组件被激活时使用。
8. deactivated：被keep-alive缓存的组件被停用时调用。
9. beforeDestroy（销毁前）：实例销毁之前调用。这一步，实例仍然完全可用，this 仍能获取到实例。
10. destroyed（销毁后）：实例销毁后调用，调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。该钩子在服务端渲染期间不被调用。
