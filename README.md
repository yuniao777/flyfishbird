# ffb
cocos creator framework

这个一个数据驱动型框架。目前仅适于于creator2.x版本。

本框架将ui和数据分离，使用数据控制ui及自定义组件属性，让组件功能化。

1、目录设计

assets下有scenes、scripts和多个bundle目录

- resources： creator的默认bundle
    - scripts： 此bundle下的代码文件夹

- bundle1： 自定义的bundle，与resources目录结构一样

- scripts： 基础代码文件夹
- scenes： 场景目录

每个bundle下都要创建一个init文件，用来初始化bundle配置


4、TableView 的 item 的根节点要添加 TableViewItem 组件

5、如果数组内的元素没有绑定数据，这时修改数组内的元素或者增删元素不会自动刷新，需要自己给自己赋值一次才能刷新

6、文本（方便本地化）

文本内容：文本里面需要本地化的内容，例如
let lang = {
    static:{
        pet_title:'宠物界面',
    }
}
此时，名为 pet_title 的节点上的Label会自动变为 宠物界面
以上为静态文本，通过 ffb.langManager.setLanguage(lang.static) 来设置

文本变量：比如需要显示金币数量
let lang = {
    static:{
        coin_label:'金币@{user_coin}',
    }
}
以上为静态文本，通过 ffb.langManager.setLanguage(lang.static) 来设置
其中，user_coin就是变量，需要通过 ffb.langManager.setVar('UserInfo', {user_coin:100}) 来绑定，当 user_coin 数据改变时，label 会自动更新

有时候，我们需要用一个label显示不同的状态，此时，需要在 data 文件中绑定
let data = {
    top:{
        user_status_label:'@{online}',
    }
}
然后再本地化文件的中添加
let lang = {
    var:{
        online:'在线',
        offline:'离线',
    }
}
以上为需要通过 ffb.langManager.setVar(lang.var) 来设置 user_status_label 引用的变量

data.top.user_status_label = '@{offline}' 此时，label会更新为离线

也就是说，所有的变量都需要通过 setVar 来设置

关于文本处理中有个varGroup，为了分离文本变量中引用的变量。在同一个varGroup中，会优先引用同一个varGroup里的变量，如果没有，才会去全局寻找
