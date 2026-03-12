function loggerMiddleware(req, res, next) {
    const timestamp = new Date().toLocaleString()
    const method = req.method
    const path = req.originalUrl || req.url

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📥 [${timestamp}] ${method} ${path}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    // Log query params if any
    if (Object.keys(req.query).length > 0) {
        console.log(`🔍 Query Params:`, req.query)
    }

    // Log route params if any
    if (Object.keys(req.params).length > 0) {
        console.log(`🏷️  Route Params:`, req.params)
    }

    // Log body field types (not values, to avoid leaking sensitive data)
    if (req.body && Object.keys(req.body).length > 0) {
        const bodyTypes = {}
        for (const [key, value] of Object.entries(req.body)) {
            bodyTypes[key] = typeof value
        }
        console.log(`📦 Body Fields:`, bodyTypes)
    }

    // Log file info if present (multer)
    if (req.file) {
        console.log(`📎 File: { fieldname: "${req.file.fieldname}", mimetype: "${req.file.mimetype}", size: ${req.file.size} bytes }`)
    }

    // Log response status on finish
    res.on("finish", () => {
        console.log(`📤 [${method} ${path}] → Status: ${res.statusCode}`)
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
    })

    next()
}

module.exports = loggerMiddleware
