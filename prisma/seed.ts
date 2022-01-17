import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const categories = [{ name: 'food' }, { name: 'cleaning' }, { name: 'household' }, { name: 'dog' }, { name: 'other' }]
    const storeTypes = [
        { name: 'Big Box' },
        { name: 'Grocery' },
        { name: 'Department' },
    ]
    const catRequests = categories.map(async (cat) => {
        return await prisma.category.upsert({
            where: {
                ...cat
            },
            update: {},
            create: cat
        })
    })

    const storeRequests = storeTypes.map(async (store) => {
        return await prisma.storeType.upsert({
            where: {
                name: store.name
            },
            update: {},
            create: store
        })
    })
    const catResults = await Promise.all(catRequests)
    const storeResults = await Promise.all(storeRequests)

    const test = await prisma.item.upsert({
        where: {
            id: 69
        },
        update: {},
        create: {
            name: 'test',
            category: {
                connectOrCreate: {
                    where: {
                        name: 'Store'
                    },
                    create: {
                        name: "Store"
                    }
                }
            },
            stores: {
                connectOrCreate: ['new tag'].map(tag => ({
                    where: { name: tag }, create: { name: tag }
                }))
            }
        },
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })