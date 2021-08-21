<template>
    <el-container class="home_container">
        <el-header>
            <div>
                <!-- <img src="../assets/homeHeader.gif" alt="" height="60px" /> -->
                <el-image
                    style="height: 64px"
                    :src="require('../assets/homeHeader.gif')"
                    :preview-src-list="[require('../assets/homeHeader.gif')]"
                >
                </el-image>
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container style="height: 1px;">
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <el-tooltip
                    class="item"
                    effect="dark"
                    :content="isCollapse ? '点击展开' : '点击折叠'"
                    placement="right"
                    :enterable="false"
                >
                    <div class="toggle" @click="toggleCollapse">
                        <i
                            :class="
                                isCollapse
                                    ? 'el-icon-s-unfold'
                                    : 'el-icon-s-fold'
                            "
                        ></i>
                    </div>
                </el-tooltip>
                <el-menu
                    :default-active="activePath"
                    class="el-menu-vertical-demo"
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409eff"
                    unique-opened
                    router
                    :collapse="isCollapse"
                    :collapse-transition="false"
                >
                    <el-submenu
                        :index="item.id + ''"
                        v-for="item in menuList"
                        :key="item.id"
                    >
                        <template slot="title">
                            <i :class="iconsList[item.id]"></i>
                            <span>{{ item.authName }}</span>
                        </template>
                        <el-menu-item
                            :index="'/' + subItem.path"
                            v-for="subItem in item.children"
                            :key="subItem.id"
                            @click="saveNavState('/' + subItem.path)"
                        >
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main><router-view></router-view></el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name: "Home",
    data() {
        return {
            menuList: [],
            iconsList: {
                125: "el-icon-user-solid",
                103: "el-icon-s-management",
                101: "el-icon-s-goods",
                102: "el-icon-s-order",
                145: "el-icon-s-marketing",
            },
            isCollapse: false,
            activePath: "",
        };
    },
    methods: {
        logout() {
            window.sessionStorage.removeItem("token");
            this.$router.push("/login");
        },
        async getMenuList() {
            const { data: res } = await this.$http.get("menus");
            if (res.meta.status !== 200)
                return this.$message({
                    duration: 2000,
                    message: res.meta.msg,
                    type: "error",
                });
            this.menuList = res.data;
        },
        toggleCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        saveNavState(activePath) {
            window.sessionStorage.setItem("activePath", activePath);
            this.activePath = activePath;
        },
    },
    created() {
        this.getMenuList();
        this.activePath = window.sessionStorage.getItem("activePath");
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("activePath");
    },
};
</script>

<style lang="less" scoped>
.home_container {
    height: 100%;
}
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 10px;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;
    // float: left;
    overflow: auto;
    .el-menu {
        border-right: none;
    }
}
.el-main {
    background-color: #eaedf1;
    // position: absolute;
    // width: 100%;
    // float: right;
    // right: 0;
    // bottom: 0;
    // top: 60px;
    overflow: auto;
}
.el-submenu [class^="el-icon-"] {
    margin-right: 10px;
}
.toggle {
    width: 100%;
    height: 56px;
    cursor: pointer;
    &:hover {
        background-color: rgb(41, 44, 54);
    }
}
.el-icon-s-unfold,
.el-icon-s-fold {
    font-size: 28px;
    color: #fff;
    // text-align: center;
    // position: relative;
    // left: 50%;
    // transform: translate(-50%);
    margin-top: 15px;
    margin-left: 20px;
}
</style>