# ffb
cocos creator framework

这是一个基于cocos creator 2.4.11 的双向绑定的mvvm框架。

主打轻量、小巧、易用、灵活性高。

使用指南：

 一、基础部分
1. 推荐项目目录组成：
- bundle： creator的bundle文件夹，支持多个bundle 
- scripts： 基础代码文件夹，可用来存放本框架等必须代码
- scenes： 存放场景文件的目录

2. bundle文件夹下的子目录组成
- audio 存放音频文件，可通过 ffb.resManager.loadAudio获取
- prefab 存放预制文件，如：主页、各种弹窗页面等预制
- res 存放资源文件
以上三个目录为**必须目录**，其他目录可自由创建

3. bundle处理
每个bundle文件夹下都必须要添加一个init文件，其内容如下：
  ```
     if (!CC_EDITOR) {
 
         cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
 
             //解析bundle里面保存的资源信息
 
             cc.assetManager.loadBundle('home', (bundle, err)=>{
 
                 ffb.resManager.addBundle(bundle);
 
             });
 
             //多语言相关
 
             ffb.langManager.setLanguage(zh_home);
 
         });
 
     }
  ```

二、使用

1. 数据绑定
- 数据根据节点名来绑定，并支持一个数据绑定多个节点。
>     const HomeUIData = {
>         // Home 预制中一个名为 user_name 的节点(可以是任意层级的子节点)
>         user_name:{           
>             // user_name 节点下的组件名。这里可以是引擎组件，也可以是自定义组件                          
>             cc_Label:{
>                 //组件中的 string 属性
>                 string:'ffb',                           
>             }
>             //节点本身
>             node:NullNode,        
>             //节点上绑定的组件                      
>             components:{
>                 cc_Label:NullLabel,                     
>             },
>         },
>     }
>     type NullNode:cc.Node = null; type NullLabe:cc.Label = null; 
>     // 上面是个小技巧，定义NullNode、NullLabel等空类型，在ts里面就会有对应类型了。如果直接写null，就会是null类型，而不是cc.Node、cc.Label类型了。   
>     
>     
>     //通过ffb.gameManager（或者ffb.dataManager）建立绑定关系
>     ffb.gameManager.setRootLayer('Home', HomeUIData); //Home 为主页预制
>     
>     //三秒钟后，屏幕上的 ffb 变成了 flyfishbird
>     setTimeout(()=>{
>         HomeUIData.user_name.string = 'flyfishbird';
>     }, 3000);

- 上面那种写法中间有太多层，这时候，我们可以通过关键字（区分大小写）来设定默认属性。如果想控制多个属性还是要用上面那种写法。

> const HomeUIData = { user_name_label:'ffb' }

- 这种写法就简洁很多。因为有label关键字（关键字需要用下划线隔开），可以直接绑定到label的string属性上。
- 我们也可以通过ffb.dataManager.registKeyword来自己定义默认属性。具体用法可以参考 DataDealer.ts 文件末尾的定义方式

2. 事件注册
- 通过 ffb.dataManager.registeEvent 来注册事件

> //给 pop_layer_btn 按钮注册一个点击事件，只要是node.emit发送的事件，都可以注册（按钮被点击时发送的是click事件）
> //所有名为 pop_layer_btn 的按钮都会触发这个事件，想不触发，可以修改节点名
> ffb.dataManager.registeEvent('pop_layer_btn', 'click', function(arg1, arg2){
>     //如果pop_layer_btn上添加了 NodeEventTag 组件，arg就是 NodeEventTag 附带的tag，后面的其他参数就是事件附带的参数。
>     ffb.gameManager.popLayer();
> });

3. 多语言
- 通过 ffb.langManager.setLanguage 来设置多语言静态文本，通过 ffb.langManager.setVar 来设置多语言文本变量

> //定义两个人名
> const LanguageData_zh = {
>     sam:'山姆·温切斯特',
>     dean:'迪恩·温切斯特',
> };
> 
> const LanguageData_en = {
>     sam:'sammy',
>     dean:'dean',
> };
> 
> ffb.langManager.setLanguage(LanguageData_zh);
> 
> const UserData = {
>     //定义游戏中的角色使用哪个人名   @{}可引用其他通过setLanguage或者setVar设置的变量
>     user_name:'@{sam}',     
>     //定义角色的攻击力           
>     user_attack:0,           
> };
> 
> ffb.langManager.setVar('UserData', UserData);
> 
> const HomeUIData = {
>     user_name:{                                   
>         cc_Label:{                                
>             string:@{user_name},                         
>         }
>     },
>     attack:{
>         cc_Label:{                                
>             string:'@{user_attack}',                         
>         }
>     }
> }

此时，user_name显示的是 山姆·温切斯特。我们添加下面代码

> UserData.user_name = '@{dean}'

现在，user_name显示的内容变成了 迪恩·温切斯特。我们再添加一段代码，将语言从中文转变成英文

> setTimeout(()=>{
>     ffb.langManager.setLanguage(LanguageData_en);
> }, 3000);

我们会发现，user_name 在三秒后，从 迪恩·温切斯特 变成了 dean 

三、进阶用法
1. varGroup 为了限定string变量引用的有效范围。
- 有时候，我们一个item预制会多次使用，这时，就需要用varGroup去区分不同的引用变量。
2. 类Label的string属性都可使用语言变量。
- 使用 ffb.dataManager.registLabelLike 来注册。具体用法可以参考 DataDealer.ts 文件末尾的定义方式

四、自带工具组件、内置关键字
1. 内置关键字 sprite skeleton progressBar button toggle slider label richtext VarSprite(需要添加 varsprite 组件)