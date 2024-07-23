'use strict';

const expect = require('chai').expect;
const request = require('request-promise');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { getMongodbCollection } = require('../config/dbConfig');

const sampleUser = {
    "_id": new ObjectId(),
    "username": "JohnDoe1",
    "firstname": "John1",
    "lastname": "Doe1",
    "email": "john1@gmail.com",
    "password": "$2b$10$HBU32JOg0AmSurTSMAlsauxN.48lLdtR/BdLPRfckyskJNEmnpKTK",
    "role": "admin",
}

const sampleProduct = {
    "_id": new ObjectId(),
    "name": "Drone1",
    "detail": "Which drone with camera is right for you? Discover the best camera drones like DJI Mavic 3 Pro, DJI Mini 3 Pro, DJI Air 2S and more!",
    "stock": 30,
    "price": 200,
    "productImg": "https://www1.djicdn.com/cms/uploads/dcac901a90cca9cee4020203b03f500b.png"
}

const sampleReview = {
    "_id": new ObjectId(),
    "content": "Which drone with camera is right for you? Discover the best camera drones like DJI Mavic 3 Pro, DJI Mini 3 Pro, DJI Air 2S and more!",
    "product": sampleProduct._id,
    "reviewImg": "https://www1.djicdn.com/cms/uploads/dcac901a90cca9cee4020203b03f500b.png",
    "user": sampleUser._id,
}

const sampleComment = {
    "comment": "Which drone with camera is right for you? Discover the best camera drones like DJI Mavic 3 Pro, DJI Mini 3 Pro, DJI Air 2S and more!",
    "product": sampleProduct._id,
    "review": sampleReview._id,
}

describe('Create Comment', () => {
    const accessToken = jwt.sign({ _id: sampleUser._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '1d' });
    before(async () => {
        const collection = await getMongodbCollection('users');
        const collectionProducts = await getMongodbCollection('products');
        const collectionReviews = await getMongodbCollection('reviews');
        await collection.insertOne(sampleUser);
        await collectionProducts.insertOne(sampleProduct);
        await collectionReviews.insertOne(sampleReview);
    });

    it('should return status code 400 when request body is null', async () => {
        try {
            await request.post(`${process.env.SERVER_URL}/api/comments/create`, {
                json: true,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                },
            });
        } catch (error) {
            const response = {
                status: 'error',
                message: 'You\'ve requested to create a new comment but the request body seems to be empty. Kindly pass the comment to be created using request body in application/json format',
                reasonPhrase: 'EmptyRequestBodyError'
            };
            expect(error.statusCode).to.equal(400);
            expect(error.error).to.eql(response);
        }
    });

    it('should create document when all validation passes', async () => {

        const comment = await request.post(`${process.env.SERVER_URL}/api/comments/create`, {
            body: sampleComment,
            json: true,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
        });
        sampleComment._id = comment._id;
        expect(comment).not.to.be.null;
    });

    after(async () => {
        const collection = await getMongodbCollection('users');
        await collection.deleteOne({ _id: sampleUser._id });
        const collectionProduct = await getMongodbCollection('products');
        await collectionProduct.deleteOne({ _id: sampleProduct._id });
        const collectionReview = await getMongodbCollection('reviews');
        await collectionReview.deleteOne({ _id: sampleReview._id });
        const collectionComment = await getMongodbCollection('comments');
        await collectionComment.deleteOne({ _id: sampleComment._id });
    });
});