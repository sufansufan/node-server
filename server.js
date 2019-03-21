// 引入node自带的http服务
const http = require('http')

// 引入node自带的child_process
const childProcess = require('child_process')

// 引入node自带处理文件
const fs = require('fs')

// 引入node自带查询字符串
const querystring = require('querystring')

// 引入node自带url包
const url = require('url')

// 引用node自带Buffer缓冲器包
// const Buffer = require('buffer')   buffer是全局变量不需要引入

// 导入nodeApi
const nodeApi = require('./utils/nodeApi')

const hostName = "localhost"

const port = "8080"

// 创建服务器
const server = http.createServer((req, res) => {
    res.statusCode = 200  //设置响应状态
    res.setHeader('Content-Type', 'text/html;charset=utf-8') //设置相应头信息 'text/plain'显示的文本
    const method = req.method
    let path = ''
    let get = {}
    let post = {}
    if (method === 'GET') {
        // 使用url.parse解析get数据

        // const { pathName, queryData } = url.parse(req.url, true) 这种在看下
        const [pathName, queryStr] = req.url.split('?')
        const queryData = querystring.parse(queryStr)
        path = pathName
        get = queryData
        complete()
    } else if (method === 'POST') {
        path = req.url
        let bufferStream = []
        req.on('data', (buffer) => {
            //post 获取buffer数据
            bufferStream.push(buffer)
        })
        req.on('end', () => {
            //将buffer数据合并
            let buffer = Buffer.concat(bufferStream)
            // 处理接收到的POST数据
            post = JSON.parse(buffer.toString())
            complete()
        })
    }

    //  在回调函数中统一处理解析后的数据
    function complete() {
        try {
            if (path === '/reg') {
                //获取get数据
                const { username, password } = get
                fs.readFile(nodeApi.users, (error, data) => {
                    if (error) {
                        res.writeHead(404)
                    } else {
                        //读取用户信息
                        const { users } = JSON.parse(data.toString())
                        const findUsername = users.find(item => (username === item.username))
                        if (findUsername) {
                            res.write(JSON.stringify({
                                error: 1,
                                msg: '此用户名已存在'
                            }))
                            res.end()
                        } else {
                            users.push({ username, password })
                            // 将新的用户列表保存到users.json文件中
                            fs.writeFile('./json/users.json', JSON.stringify({ users }), (error) => {
                                if (error) {
                                    res.writeHead(404)
                                } else {
                                    res.write(JSON.stringify({
                                        error: 0,
                                        msg: '注册成功'
                                    }))
                                }
                                res.end()
                            })
                        }
                    }
                })
            } else if (path === '/login') {
                const { username, password } = post
                // 读取users.json
                fs.readFile(nodeApi.users, (error, data) => {
                    if (error) {
                        res.writeHead(404)
                    } else {
                        // 获取user列表数据
                        const { users } = JSON.parse(data.toString())
                        const findUsername = users.find(item => (username === item.username))

                        if (findUsername) {
                            // 用户名存在，则校验密码是否正确
                            if (findUsername.password === password) {
                                res.write(JSON.stringify({
                                    error: 0,
                                    msg: '登录成功'
                                }))
                            } else {
                                res.write(JSON.stringify({
                                    error: 1,
                                    msg: '密码错误'
                                }))
                            }
                        } else {
                            res.write(JSON.stringify({
                                error: 1,
                                msg: '该用户不存在'
                            }))
                        }
                    }
                    res.end()
                })
            } else {
                // 若不是注册或登录接口，则直接返回相应文件
                fs.readFile(`./view${req.url === '/' ? '/index.html' : req.url}`, (error, data) => {
                    if (error) {
                        res.writeHead(404)
                    } else {
                        res.write(data)
                    }
                    res.end()
                })
            }
        } catch (error) {
            console.error(error)
        }
    }
})


// 开启监听
server.listen(port, hostName, () => {
    // 在命令行打印运行结果
    console.log(`Server running at http://${hostName}:${port}/`);
    // 使用默认浏览器打开地址
    childProcess.exec(`start http://${hostName}:${port}/`);
});