# 今天的心情记录网站

这是按你的需求做好的第一版：

- 不需要登录
- 自动记录提交时间
- 评分都是 1-5 分
- 躯体化支持“有 / 没有”加备注
- 提交前显示第一张图
- 提交成功后切换成第二张图
- 数据保存到 Supabase
- 你可以在 Supabase 后台导出 CSV

## 文件说明

- `index.html`：网页结构
- `style.css`：网页样式
- `app.js`：提交逻辑
- `setup.sql`：Supabase 建表和权限
- `assets/start.png`：开始图片
- `assets/success.png`：提交后图片

## 你接下来要做的事

### 1. 在 Supabase 建项目
进入 Supabase，创建一个新 project。

### 2. 执行 SQL
打开 Supabase 的 SQL Editor，把 `setup.sql` 里面的内容全部复制进去执行。

### 3. 拿到两个值
在 Supabase 项目里找到：

- Project URL
- anon public key

然后打开 `app.js`，把这两行替换掉：

```javascript
const SUPABASE_URL = "把你的_SUPABASE_URL_贴到这里";
const SUPABASE_ANON_KEY = "把你的_SUPABASE_ANON_KEY_贴到这里";
```

### 4. 上传到 GitHub
新建一个仓库，例如：`emotion-tracker`

把这些文件全部上传上去。

### 5. 开启 GitHub Pages
在仓库里：
`Settings -> Pages -> Build and deployment -> Source`
选择：
`Deploy from a branch`

然后选择：
- Branch: `main`
- Folder: `/root`

保存后，等一会儿就会生成网站地址。

你的网站地址通常会像这样：

`https://pzr822.github.io/emotion-tracker/`

## 导出 CSV

进入 Supabase：

`Table Editor -> emotion_entries`

里面就能看到所有记录，一般可以直接导出 CSV。

## 下一步我还能继续帮你做的

后面你可以继续让我帮你加：

- 只有你知道的简单访问口令
- 数据图表
- 更可爱的动画
- 每天只允许提交一次
- 管理员导出页面
- 自定义文案
