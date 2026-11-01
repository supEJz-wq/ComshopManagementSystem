// Admin navigation shared by Home, PCs, and Rentals workflow tests.
// Each spec checks the destination page after using a navigation method.
class sideBarAdmin{
    constructor(page){
        this.page = page;

       this.links = page.locator('aside nav a');
       this.signOutButton = page.getByRole('button', { name: 'Sign out' });
       // The first sidebar paragraph is the brand; the role has its own visible text.
       this.role = page.getByRole('complementary').getByText('Admin / Owner', {exact: true});

    // Nav links are <a> (NavLink), not <button>.
       this.home = page.getByRole('link', { name: 'Home' });
       this.pcs = page.getByRole('link', { name: 'PCs' });
       this.rentals = page.getByRole('link', { name: 'Rentals' });
       this.payments = page.getByRole('link', { name: 'Payments' });
       this.revenue = page.getByRole('link', { name: 'Revenue' });
       this.analytics = page.getByRole('link', { name: 'Analytics' });
       this.accounts = page.getByRole('link', { name: 'Accounts' });
}

    async clickhome(){
        await this.home.click();
    }

     async clickpcs(){
        await this.pcs.click();
    }

     async clickrentals(){
        await this.rentals.click();
    }

     async clickpayments(){
        await this.payments.click();
    }

     async clickrevenue(){
        await this.revenue.click();
    }

     async clickanalytics(){
        await this.analytics.click();
    }

     async clickaccounts(){
        await this.accounts.click();
    }

     async clickSignout(){
        await this.signOutButton.click();
    }


}


module.exports = { sideBarAdmin };
