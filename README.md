# node搭建服务器

**write和end的区别**

~~~
  res.write('a')  //通常使用res.write方法向前端返回数据，该方法可调用多次，返回的数据会被拼接到一起。
  res.write('b')
  res.write('c')
  res.end('hello world\n') //需要注意的是，必须调用res.end方法结束请求，否则前端会一直处于等待状态 
~~~

**get处理数据**

~~~
  const [pathName, queryStr] = req.url.split('?')
  const queryData = querystring.parse(queryStr)
~~~

**post处理数据**

POST数据量通常较大，通常不会一次性从客户端发送到服务端，具体每次发送的大小由协议，以及客户端与服务端之间的协商决定。而它实现了可读流接口，因此具有了可读流的data、end等事件。

~~~
  let bufferArray = []  // 用于存储data事件获取的Buffer数据。
  req.on('data', (buffer) => {
    bufferArray.push(buffer)  // 将Buffer数据存储在数组中。
  })
  req.on('end', () => {
    // Buffer 类是一个全局变量，使用时无需 require('buffer').Buffer。
    // Buffer.concat方法用于合并Buffer数组。
    const buffer = Buffer.concat(bufferArray)
    // 已知Buffer数据只是字符串，则可以直接用toString将其转换成字符串。
    const post = querystring.parse(buffer.toString())
  })
~~~

**fs文件写入**

~~~
  fs.writeFile('./files/test.txt', 'test', (error) => {
      if (error) {
          console.log('文件写入失败', error)
      } else {
          console.log('文件写入成功')
      }
  })
~~~

**fs文件读取**

~~~
fs.readFile('./files/test.txt', (error, data) => {
    if (error) {
        console.log('文件读取失败', error)
    } else {
        // 此处因确定读取到的数据是字符串，可以直接用toString方法将Buffer转为字符串。
        // 若是需要传输给浏览器可以直接用Buffer，机器之间通信是直接用Buffer数据。
        console.log('文件读取成功', data.toString())
    }
})
~~~

**渲染html文件**

~~~
  fs.readFile(`./view${req.url === '/' ? '/index.html' : req.url}`, (error, buffer) => { // 根据URL查找读取相应的文件。
    // 读取文件
    if (error) {  // 若读取错误，则向前端返回404状态码，以及内容Not Found。
        res.writeHead(404)
        res.write('Not Found')
    } else {  // 若读取成功，则向前端返回读取到的文件。
        res.write(buffer)
    }
    res.end()  // 关闭连接。
  })
~~~
