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
>     if (!CC_EDITOR) {
> 
>         cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
> 
>             //解析bundle里面保存的资源信息
> 
>             cc.assetManager.loadBundle('home', (bundle, err)=>{
> 
>                 ffb.resManager.addBundle(bundle);
> 
>             });
> 
>             //多语言相关
> 
>             ffb.langManager.setLanguage(zh_home);
> 
>         });
> 
>     }

二、使用

1. GameManager
- GameManager控制着游戏页面的显示，场景的加载。详细的内容看 https://github.com/yuniao777/flyfishbird/blob/main/flyfishbird.d.ts

2. 数据绑定
- 数据根据节点名来绑定，指定绑定的组件，以及组件上的某个属性。

3. 事件注册

4. 多语言

三、进阶用法
1. 节点名关键字
2. varGroup

四、自带工具组件