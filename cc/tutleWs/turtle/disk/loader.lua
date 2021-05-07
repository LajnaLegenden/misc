local content = http.get("http://127.0.0.1:1338/static/startup.lua").readAll()
if not content then error("Error not founmd") end

f = fs.open("startup", "w")
f.write(content)
f.close()
if fs.exists('/disk/cords') then
    local cordsHandle = io.open("/disk/cords");
    local cords = cordsHandle.read(cordsHandle)
    c = fs.open("/disk/cords", "w")
    c.write(cords)
    c.close()
else
    if not fs.exists('/cords') then
        cords = fs.open("cords", "w")
        cords.write('{"x":60,"y":72,"z":249,"d":"e"}')
        cords.close()
    end
end

local id = multishell.launch({}, "/startup")
multishell.setTitle(id, "WS")
multishell.setFocus(id)
