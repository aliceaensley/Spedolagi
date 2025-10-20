-- server.lua atau sv_youtube.lua

-- 1. API KEY ANDA SUDAH DIMASUKKAN DI SINI
local YOUTUBE_API_KEY = "AIzaSyBXQ0vrsQPFnj9Dif2CM_ihZ5pBZDBDKjw" 

-- 2. ⚠️ GANTI 'resource_name' DENGAN NAMA RESOURCE ANDA (HARUS SAMA DENGAN JAVASCRIPT)
local RESOURCE_NAME = "resource_name" 

-- Listener yang memastikan NUI callback hanya di-register sekali saat resource dimulai
AddEventHandler('onResourceStart', function(resourceName)
    if (resourceName == GetCurrentResourceName()) then
        
        -- Event NUI Listener untuk Pencarian YouTube
        RegisterNuiCallbackType('youtubeSearch')
        on('__cfx_nui:youtubeSearch', function(data, cb)
            local query = data.query or "Musik Populer Indonesia"
            
            print("[YOUTUBE NUI] Menerima permintaan pencarian untuk: " .. query)

            searchYouTubeAPI(query, function(results)
                cb(results)
            end)
        end)
    end
end)


-- Fungsi untuk memanggil YouTube Data API v3
function searchYouTubeAPI(query, callback)
    local youtubeUrl = "https://www.googleapis.com/youtube/v3/search"
    
    -- Parameter query URL
    local params = {
        key = YOUTUBE_API_KEY,
        part = "snippet",
        q = query, 
        type = "video", -- Kita filter hanya tipe 'video'
        maxResults = 7, 
        regionCode = "ID" 
    }
    
    -- Konversi parameter ke string query
    local queryStr = ""
    for k, v in pairs(params) do
        queryStr = queryStr .. (queryStr == "" and "" or "&") .. k .. "=" .. urlEncode(v)
    end
    
    local fullUrl = youtubeUrl .. "?" .. queryStr
    
    -- Panggil API menggunakan PerformHttpRequest
    PerformHttpRequest(fullUrl, function(statusCode, resultData, resultHeaders)
        if statusCode == 200 then
            local data = json.decode(resultData)
            local finalResults = {}
            
            if data and data.items then
                for _, item in ipairs(data.items) do
                    -- ✅ Filter yang memastikan item adalah video yang dapat diputar
                    if item.id and item.id.kind == "youtube#video" then
                        table.insert(finalResults, {
                            title = item.snippet.title,
                            channel_name = item.snippet.channelTitle,
                            external_video_id = item.id.videoId 
                        })
                    end
                end
            end
            
            callback(finalResults)
        else
            print("[YOUTUBE API ERROR] Status Code " .. statusCode .. ". Memeriksa API Key atau kuota.")
            callback({})
        end
    end)
end

-- Fungsi utility untuk mengkodekan URL (wajib)
function urlEncode(str)
    if (str) then
        str = string.gsub(str, "\n", "\r\n")
        str = string.gsub(str, "([^%w ])", function (c)
            return string.format("%%%02X", string.byte(c))
        end)
        str = string.gsub(str, " ", "+")
    end
    return str
end
