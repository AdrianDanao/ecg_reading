import { Router, Request, Response } from "express";
import User from "../models/User";
import * as jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) res.status(401).json({ message: "Invalid Credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) res.status(401).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: "1h"
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) res.status(400).json({ message: "Please provide email and password" });

        const existing = await User.findOne({ email });
        if (existing) res.status(400).json({ message: "User already exists" });

        const user = new User({ email, password });
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: "1h"
        });

        res.status(201).json({ message: "User Created", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
})

router.get("/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) res.status(401).json({ message: "Unauthorized" });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET!);
        res.json({ user });
    } catch (err) {
        res.status(403).json({ message: "Invalid Token" });
    }
})

export default router;
