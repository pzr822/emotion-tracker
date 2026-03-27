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
