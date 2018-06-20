# 配置

## **环境**

- 配置nodejs环境
- npm安装相应的模块
- 在index.js里配置 **mysql** 数据库连接

## **数据库**
### 数据库名：**jobsql**

##### **表**

###### SADUser  学生处 登录帐号和密码及用户名表
|列  |注释  |类型|长度|
| :--------: | :--------:|:--:|:--:|
|id  | |int|11|
|user|帐号|varchar|64|
|pw|登录密码|varchar|64|
|name|用户名|varchar|64|

###### teacherUser 辅导员 登录帐号和密码及用户名表
|列  |注释  |类型|长度|
| :--------: | :--------:|:--:|:--:|
|id  | |int|11|
|user|帐号|varchar|64|
|pw|登录密码|varchar|64|
|name|用户名|varchar|64|

###### teacherClass 辅导员及所带班级表
|列  |注释  |类型|长度|
| :--------: | :--------:|:--:|:--:|
|n||int|11|
|id|辅导员的登录帐号|varchar|64|
|class|辅导员所带班级|varchar|32|

###### studentUser 学生 登录帐号和密码及用户名表
|列  |注释  |类型|长度|
| :--------: | :--------:|:--:|:--:|
|id  ||int|16|
|user|帐号(**学号**)|varchar|64|
|pw|登录密码|varchar|64|
|name|姓名|varchar|64|


###### job 学生就业信息表
|列  |注释  |类型|长度|
| :--------: | :--------:|:--:|:--:|
|id|学生id|int|16|
|class|班级|varchar|32|
|name|姓名|varchar|64|
|status|就业状态|bit|1|
|companyName|单位名称|varchar|64|
|address|地址|varchar|64|
|department|工作部门|varchar|64|
|charge|部门负责人|varchar|32|
|chargePhone|负责人联系电话|varchar|11|
|studentPhone|学生联系电话|varchar|11|
|time|信息最后修改时间|timestamp||
