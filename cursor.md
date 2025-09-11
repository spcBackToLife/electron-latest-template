# 增加管理页面

在 views/home 下新建项目工作台，参考如图实现，采用 react + ts + tailwindcss + less，包含：

- 顶部导航栏，保安：首页、会场页面、活动、素材库，右侧有个人信息、通知图标
- 左侧个人卡片
  - 未加入团队出现立即加入按钮，加入了，默认显示一个团队，可以做团队切换
  - 下面有：我的会场、我的活动、我的素材，点击更多进入列表页面
- 卡片下方有快速创建会场按钮、更多按钮（更多里有：创建活动）
- 中间是：最近创建会场、最近活动
- 右侧是常用功能：我的活动等你帮我规划规划
- 下方是最近活动的一些数据情况等
- 整体工作台是：营销活动会场搭建相关的，详细的你帮我想想如何设计。
- 注意组件抽象，不要都写在一个文件里，合理的拆分组件。
- 风格注意桌面应用和 Web 应用都能适配。

# 调用通信：初始化会场信息

1. 在 shared/constant 里增加 EVENT_NAME 的定义：InitVenueProject
2. 在 electron/main 目录下新增 venue 目录，并参考： settings/index.ts 目录实现一个 VenueManager ,里面增加 initVenueProject 异步方法，返回：{
   path: string;
   projectId: string;
   }，参数有：{venueName: string, venueDescription: string}
3. 在 electron/main/index.ts 里导入：import './venue'
4. 在 preload/api.ts 里注册方法
5. 在 src/renderApis/index.ts 补充定义
6. 在 electron/electron-env.d.ts 增加/修改定义

# 新增通用调用通信

1. 在 shared/constant 里增加 EVENT_NAME 的定义
2. 在 electron/main 目录下新增 venue 目录，并参考： settings/index.ts 目录实现一个 Manager ,里面增加 相关方法定义和实现，注意返回结构参考：shared/infra/libs/axios.ts 的 Promise<RequestResult<V>>
3. 在 electron/main/index.ts 里导入，如：import './settings'
4. 在 preload/api.ts 里注册方法
5. 在 src/renderApis/index.ts 补充定义
6. 在 electron/electron-env.d.ts 增加/修改定义

参考如上流程帮我新增：venueManager，实现初始化方法

# 修改通用调用通信

1. 在 electron/main/venue/index.ts 里修改 initVenueProject 方法为创建本地仓库。
2. 在 electron/main/venue/index.ts 里新增方法：

- 创建 Git 远程仓库，参数：{venueName: string, venueDescription: string}，返回：gitUrl
- 推送代码到 Git 仓库，参数：{localPath: string, gitUrl: string}，返回：成功还是失败以及失败原因
- 保存到 venue，参数定义参考：shared/apis/venue.ts 保存场景方法，直接调用 shared/apis/venue.ts 相关方法。

上述方法可以先 mock 实现，除了：保存到 venue 方法 3. 注意返回结构参考：shared/infra/libs/axios.ts 的 Promise<RequestResult<V>>

4. 在 preload/api.ts 里注册方法
5. 在 src/renderApis/index.ts 补充定义
6. 在 electron/electron-env.d.ts 增加/修改定义

参考如上流程帮我新增：venueManager，实现初始化方法

# 修改通用调用通信 2

1. 在 electron/main/venue/index.ts 里修改 createLocalRepo 方法，增加会场 ID 参数（英文的）
2. 在 preload/api.ts 里修改注册方法
3. 在 src/renderApis/index.ts 修改定义
4. 在 electron/electron-env.d.ts 修改定义

# 调用接口：

1. 参考：/Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/schemas/venue.py、/Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/api/endpoints/team.py 接口定义
2. 参考：/Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/api/api.py、/Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/main.py 路由定义
3. 在 shared/apis 下参考：src/apis/apiDemo.ts，定义 venue、team 相关接口请求
4. 请求整体路径前缀：/zspt-marketing-ai-api/v1

# 团队管理

点击立即加入团队按钮后，top 顶栏切换到团队 tab，展示团队列表卡片页面：

- 页面上方是：我的团队、所有团队
- 以卡片形式呈现团队列表
- 卡片列表右侧有搜索框，基于团队名进行搜索
- 在所有团队里的卡片中，如果当前没有加入，鼠标悬浮后展示加入按钮，否则展示已加入标签
- 在我的团队列表，如果为空：展示：新建、加入 按钮

1. 团队相关接口在：src/apis/team.ts
2. 获取团队数据后，通过 chatService 全局管理：
   const chatService = useService(ChatService);
   chatService.globalState.setxxxx
3. 团队表信息如下：
   CREATE TABLE IF NOT EXISTS zspt_marketing_teams (
   id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键 ID',
   name VARCHAR(255) NOT NULL COMMENT '团队名称',
   description TEXT COMMENT '团队描述',
   icon VARCHAR(500) COMMENT '团队图标',
   admin_user VARCHAR(255) NOT NULL COMMENT '管理员（默认创建人为管理员）',
   members JSON DEFAULT '[]' COMMENT '团队成员',
   status VARCHAR(20) DEFAULT 'normal' COMMENT '状态（normal:正常, deleted:删除）',
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间'
   ) COMMENT='营销平台团队表';
4. 点击新建进入新建团队表单页面，路由注意用 navigate
5. 注意做好组件抽象，不要都写在一个文件里，抽出的组件要建立文件夹

# 安装工具

帮我优化这个 createLocalRepo

1. 创建路径写成一个通用方法，入参是 projectId，后面启动啥的要用
2. 帮我在当前目录下新建一个 utils 目录，里面放如下内容：

- 自动安装 Node 的 ts 工具函数
- 自动安装 Git 的 ts 工具函数
- 自动安装 Pnpm 的 ts 工具函数
- 检测本地是否存在 Node(14)、Git、Pnpm 的 ts 工具函数，参数可包含各类工具的版本号要求

帮我抽象一个工具类：repoManager 放到当前目录下，主要功能：

- 检测本地环境，是否包含 Node(14)、Git、Pnpm，如果缺少环境则自动安装

# 仓库管理类

帮我优化这个 createLocalRepo

1. 创建路径写成一个通用方法，入参是 projectId，后面启动啥的要用
2. 帮我抽象一个工具类：repoManager 放到当前目录下，入参是工作目录路径和 gitTemplate 参数，主要功能：

- 初始化项目

  - 如果传递了 gitTemplate，则从 gitTemplate 路径下拷贝文件到工作目录下
  - 如果没有传递，则用 npx：在工作目录下创建一个 vite + react + less + tailwindcss + ts 的项目模板
  - 如果成功则返回：{ success: true, message: '项目初始化成功' },否则返回：{ success: false, message: '项目初始化失败' }

- 启动项目
  - 启动命令：pnpm run dev
  - 如果端口被占用要自动切换端口
  - 启动成功之后能够返回启动的端口和路径，被占用的端口等信息，格式：{ success: true, message: '项目启动成功', port: 3000, path: '/Users/xxx/xxx/xxx' }
- 停止项目
- 重启项目
- 添加依赖
  - 成功提示：{ success: true, message: '依赖添加成功' }

# 窗口管理器

1. 帮我在主进程里实现一个窗口管理器：winManager ，放在 electron/main/winManager 目录下，主要功能：

- 可以创建一个窗口
- 可以给某个窗口发送消息
- 可以实现一个通用方法，整体是 promise 异步的，逻辑如下：
  - 首先给某个窗口发送消息
  - 然后等待消息回复
  - 回复完成就 resolve
  - 超时设置 30 min，自动 reject
  - 注意发送和接收的唯一性，应该需要 requestId 参数。

2. 在：electron/preload/api.ts 需要定义一个通用的方法，监听主进程消息；还需要一个发送回复消息方法。注意接收参数和回复参数需要和上面实现的收发协议一致。

通过上述流程实现，主进程和渲染进程的异步交互，等待用户操作完成后继续下一步。

# AI 返回指令集合数组

根据实践，发现当有选项的时候，AI 需要返回对应的操作映射输入

- 如果等待的是用户输入文本，则直接：sendInput('xxx');
- 如果等待用户的是做选择，那么用户选择后，AI 需要将用户选择转化为对应的动作指令，比如：上、下、左右、回车等，示例如下，
  - 我要选择第三个选项，则 AI 返回动作数组：[‘\x1b[B', '\x1b[B', '\x1b[B', '\r']
  - 如果是多选，我要连续选择第二个，第三个，则动作数组是：['\x1b[B', '\r', '\x1b[B', '\r']，即先按下，然后确认，再按下再确认
    以此类推，实现选择能力，并通过数组循环发送：sendInput('xxx'); 对应动作。

# 增加方法

1. 在 electron/main/venue/repoManager.ts 里增加清理项目的函数
   - 根据 getProjectPath 获得要清理的目录，删除
2. 在 preload/api.ts 里注册方法
3. 在 src/renderApis/index.ts 补充定义
4. 在 electron/electron-env.d.ts 增加/修改定义

# 增加一张表

1. 在 sqlite3 里新增一张表，存储页面性能，包括字段：

- id、venueId、url、首屏渲染时间、RCF 等各种性能监控指标

2. 在 sqlite3 里增加对应的存储方法：savePagePerformance，增加 EVENT_NAME 定义、还有查询方法：getPerformanceByVenueId
3. 在 preload/api.ts 里注册方法
4. 在 src/renderApis/index.ts 补充定义
5. 在 electron/electron-env.d.ts 增加/修改定义

# 增加 API 管理能力

- 参考后端：/Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/schemas/marketing_api.py 和 /Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/schemas/marketing_api.py 接口定义
- 在：src/views/venue/venueEditor/components/activity/index.tsx 和 src/views/venue/venueEditor/components/activity/components/API 实现 API 管理功能，包括：
- 列表查看
- 列表操作
  - API 详情查看（抽屉打开）
    - 详情可以查看到 mock 数据，按场景 Tab 展示不同场景下的 mock 结果。
  - API 创建（抽屉打开）：名称、请求方式、路径、参数、返回值
  - API 修改（抽屉打开）
  - API 删除（抽屉打开）
  - API Mock 开启/关闭
  - API Mock 场景选择
  - 增加 API mock 数据（抽屉打开）

创建抽屉里，增加参数和返回值的定义：

- 参数字段支持点击按钮增加参数
- 每个参数有：名称、类型、是否必填、默认值、描述
- 参数结构支持对象嵌套定义
- 返回值定义同参数结构
- 参数和返回值都支持 JSON 预览和界面编辑功能，这个可以抽象一个公共组件。
- JSON 编辑器可以选择一个好用的开源项目
- 参数和返回结果定义提交时候 JSON 结构参考如下，如果有更好的结构也可以推荐我：

```json
[
	{
		"key": "name",
		"type": "string",
		"required": true,
		"default": "test",
		"description": "名称"
	},
	{
		"key": "workInfo",
		"type": "object",
		"required": true,
		"default": { "location": "beijing", "workingYears": 10 },
		"description": "工作信息",
		"children": [
			{
				"key": "location",
				"type": "string",
				"required": true,
				"default": "beijing",
				"description": "工作地点"
			},
			{
				"key": "workingYears",
				"type": "number",
				"required": true,
				"default": 10
			}
		]
	}
]
```

前端规范：

- 使用 antd 组件库
- 参考：src/apis/activity.ts 完整的定义 API：参数、返回值、请求方式、路径
- 参考：src/services/chatGlobalState/index.ts 里的 venues 来管理会场对应的 API 数据

# 实现素材管理

## 业务内容

- 参考后端：/Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/api/endpoints/marketing_resource.py 和 /Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-server/app/schemas/marketing_resource.py 接口定义
- 在：src/views/venue/venueEditor/components/activity/index.tsx 和 /Users/kp/Documents/ai-works/ai-marketing-platform/ai-marketing-client/src/views/venue/venueEditor/components/activity/components/Materials/index.tsx 实现素材管理功能，包括：新增、删除、编辑、查询
- 列表采用卡片展示图片素材，展示内容包括：图片、名称、描述，支持名称、描述前端模糊搜索。
- 卡片操作包括：删除、编辑、预览、复制地址
- 预览可以使用 antd 的预览组件展示
- 创建素材、修改素材包含字段：
  resource_name: str = Field(..., max_length=255, description="素材名称")
  resource_width: Optional[int] = Field(None, ge=1, description="素材宽度")
  resource_height: Optional[int] = Field(None, ge=1, description="素材高度")
  resource_description: Optional[str] = Field(None, description="素材描述")
  resource_url: str = Field(..., max_length=1000, description="素材地址")
- 上传素材使用：src/apis/upload.ts 这个接口，先上传完获得图片链接后，再前端展示出来，填写表单后一起提交。

## 前端规范：

- 使用 antd 组件库
- 参考：src/apis/activity.ts 完整的定义 API：参数、返回值、请求方式、路径
- 参考：src/services/chatGlobalState/index.ts 里的
  venues$: LiveData<VenueListInfo | null> = new LiveData<VenueListInfo | null>(
  null
  );
  来管理会场对应的 API 数据，包含：setVeunes 方法
- 参考：src/hooks/useVenues.ts 使用对应数据
- 注意合理的拆分组件，不要使得页面代码过于复杂，拆分组件规范为：
- components/文件夹/index.tsx 这则样

注意，要严格遵守上面的请求定义和状态管理。

# 消息处理

# 项目背景

- ChatService 是我管理聊天所有功能的地方：src/services/chatGlobalState/index.ts
- ChatGlobalStateEntity 存储了各种状态管理，包括：currentStreamMsg 这个就是在处理流式消息时的呈现，相关方法有：updateCurrentStreamMsg 、setCurrentStreamMsg、clearCurrentStreamMsg（src/services/chatGlobalState/chatGlobalStateEntity.ts）
- 原先我的发送消息在：chatService 里的：sendNewMessage、sendStreamRequest
- 消息渲染逻辑在这里：src/views/aiChat/panels/ConversationPanel/MessageList/index.tsx
- 模型最终发消息在这里面：src/providers/agno/index.ts

# 要求

- 现在我的流程还是和以前一样，在：chatService.sendStreamRequest 发送消息，调用：src/providers/agno/index.ts 里的：doCreateMessage ，然后通过 renderApi 发送 ipc 消息给主进程
- 主进程在：electron/main/venue/index.ts 里通过：sendMessageStream 向真正的大模型发送消息
  现在参考：packages/cli/src/ui/hooks/useGeminiStream.ts 的 processGeminiStreamEvents，帮我完成：electron/main/venue/index.ts 里：sendMessageStream 中完成对模型消息的解读。

其中：

- 过程消息，通过：this.winManager.sendMessage 这样发送消息给渲染进程，如： EVENT_NAME.AiThought
- 在 src/providers/agno/index.ts 中，await renderApi.sendMessageStream， promise 最终结束，则表示流输出完成
- 在 src/providers/agno/index.ts 中，通过：renderApi.registerMessageHandler 方法监听主进程 sendMessage 消息，并完成相关处理

# 循环引用检查

- npm install -g madge

# 检查循环引用

madge --circular electron/main/coder/core/llm_adapters/anthropic/code_server/server.ts

- baseChat -> config -> aiClient -> baseChat

# 结束工具后

- 需要调用： onComplete 来继续提交工具调用给模型，继续接下来的事情
- submitQuery 等于再调用一次：createRealTimeStream 这个

# 消息类型增加

- 完成类型扩展
- 实现消息存储： 前端状态存储、后端接口存储
- 实现消息展示

# 消息错误

1. 错误后应不再继续！！
